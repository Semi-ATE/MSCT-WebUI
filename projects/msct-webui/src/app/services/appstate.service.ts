import { Injectable, OnDestroy } from '@angular/core';
import { AppState, selectDeviceId } from './../app.state';
import { Store } from '@ngrx/store';
import { Status } from './../models/status.model';
import { CommunicationService } from './communication.service';
import * as StatusActions from './../actions/status.actions';
import * as ResultActions from './../actions/result.actions';
import * as ConsoleActions from './../actions/console.actions';
import * as UserSettingsActions from './../actions/usersettings.actions';
import * as ConnectionIdActions from './../actions/connectionid.actions';
import * as YieldActions from './../actions/yield.actions';
import * as LotDataActions from './../actions/lotdata.actions';
import * as BinTableActions from '../actions/bintable.actions';
import { ConsoleEntry } from '../models/console.model';
import { StdfRecord, StdfRecordType, StdfRecordPropertyValue, PrrRecord, STDF_MIR_ATTRIBUTES, MirRecord } from './../stdf/stdf-stuff';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { LogLevel, TestOptionSetting, TestOptionType, UserSettings } from '../models/usersettings.model';
import { TestOptionValue } from '../system-control/test-option/test-option.component';
import { saveAs } from 'file-saver';
import { ModalDialogFilterSetting, SettingType } from '../models/storage.model';
import { StorageMap } from '@ngx-pwa/local-storage';
import { takeUntil } from 'rxjs/operators';
import { MessageTypes } from './types';

export const LOG_LEVEL_TO_FILTER_TEXT = new Map<LogLevel, string>(
  [
    [LogLevel.Debug, 'debug'],
    [LogLevel.Warning, 'warning'],
    [LogLevel.Info, 'info'],
    [LogLevel.Error, 'error']
  ]
  );

export const FILTER_TEXT_TO_LOG_LEVEL = new Map<string, LogLevel>(
  [
    ['debug', LogLevel.Debug],
    ['warning', LogLevel.Warning],
    ['info', LogLevel.Info],
    ['error', LogLevel.Error]
  ]
);

@Injectable({providedIn: 'root'})
export class AppstateService implements OnDestroy {

  rebuildRecords$: Subject<boolean>;
  newRecordReceived$: Subject<StdfRecord[]>;
  stdfRecords: Array<StdfRecord[]>;
  systemTime: string;
  showModalDialog$: Subject<number>;


  modalDialogFilter$: BehaviorSubject<Array<LogLevel>>;
  private readonly ngUnsubscribe: Subject<void>;
  private deviceId: string;
  private numberOfReceivedLogdataServerMessages: number;
  private serverMessageOrderIdCounter: number;
  private readonly subscriptionCommunication: Subscription;

  constructor(
    private readonly _communicationService: CommunicationService,
    private readonly store: Store<AppState>,
    private readonly storage: StorageMap) {
    this.ngUnsubscribe = new Subject<void>();
    this.deviceId = '';
    this.stdfRecords = [];
    this.systemTime = '';
    this.modalDialogFilter$ = new BehaviorSubject<Array<LogLevel>>([]);
    this.newRecordReceived$ = new Subject<StdfRecord[]>();
    this.rebuildRecords$ = new Subject<boolean>();
    this.subscriptionCommunication = this._communicationService.message.subscribe(msg => this.handleServerMessage(msg));
    this.numberOfReceivedLogdataServerMessages = 0;
    this.serverMessageOrderIdCounter = 1;
    this.showModalDialog$ = new Subject<number>();
    this.subscribeDeviceId();
  }

  ngOnDestroy(): void {
    this.subscriptionCommunication.unsubscribe();
    this.newRecordReceived$.complete();
    this.rebuildRecords$.complete();
    this.showModalDialog$.complete();
  }

  clearStdfRecords(): void {
    this.stdfRecords = [];
    this.rebuildRecords$.next(true);
  }

  resetDialogMechanism(): void {
    this.numberOfReceivedLogdataServerMessages = 0;
  }

  setModalDialogFilter(value: Array<LogLevel>): void {
    this.modalDialogFilter$.next(value);
    this.saveSettings();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleServerMessage(serverMessage: any): void {
    // update system status must be called first
    this.updateSystemStatus(serverMessage);
    this.updateResults(serverMessage);
    this.updateConsole(serverMessage);
    this.updateUserSettings(serverMessage);
    this.handleLogfile(serverMessage);
    this.updateConnectionId(serverMessage);
    this.updateYield(serverMessage);
    this.updateLotData(serverMessage);
    this.updateBinTable(serverMessage);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private updateSystemStatus(serverMessage: any): void {
    if (serverMessage.type === MessageTypes.Status && serverMessage.payload) {
      const receivedStatus: Status = {
        deviceId: serverMessage.payload.device_id,
        env: serverMessage.payload.env,
        handler: serverMessage.payload.handler,
        time: serverMessage.payload.systemTime,
        sites: serverMessage.payload.sites,
        program: serverMessage.payload.program,
        log: serverMessage.payload.log,
        state: serverMessage.payload.state,
        reason: serverMessage.payload.error_message,
        lotNumber: serverMessage.payload.lot_number,
      };
      this.systemTime = serverMessage.payload.systemTime;
      this.store.dispatch(StatusActions.updateStatus({status: receivedStatus}));
    }
  }

  private updateBinStatus(record: StdfRecord): void {
    if (record.type === StdfRecordType.Prr) {
      const prr = new PrrRecord();
      prr.values = record.values;
      this.store.dispatch(ResultActions.addResult({prr}));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private updateResults(serverMessage: any): void {
    if (serverMessage.type === MessageTypes.Testresult) {
      const newReceivedRecords: StdfRecord[] = [];
      serverMessage.payload.forEach(e => {
        const record: StdfRecord = {
          type: e.type,
          values: Object.entries(e).filter(([k, _v]) => k !== 'type')
            .map(([k, v]) => {
              return {
                key: k,
                value: v as StdfRecordPropertyValue
              };
            })
        };
        newReceivedRecords.push(record);
        this.updateBinStatus(record);
      });
      this.stdfRecords.push(newReceivedRecords);
      this.newRecordReceived$.next(newReceivedRecords);
    }
    if (serverMessage.type === MessageTypes.Testresults) {
      // clear/delete all stored records
      this.stdfRecords.length = 0;
      serverMessage.payload.forEach(e => {
        const programResult = new Array<StdfRecord>();
        if (e.length > 0) {
          e.forEach(a => {
            const record: StdfRecord = {
              type: a.type,
              values: Object.entries(a).filter(([k, _v]) => k !== 'type')
                .map(([k, v]) => {
                  return {
                    key: k,
                    value: v as StdfRecordPropertyValue
                  };
                })
            };
            programResult.push(record);
            this.updateBinStatus(record);
          });
          this.stdfRecords.push(programResult);
        }
      });
      this.rebuildRecords$.next(true);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private updateConsole(serverMessage: any): void {
    if (serverMessage.type === MessageTypes.Logdata) {
      const entriesToAdd: ConsoleEntry[] = [];
      serverMessage.payload.forEach(
        e => {
          entriesToAdd.push({
            description: e.description,
            date: e.date,
            type: e.type,
            source: e.source,
            orderMessageId: this.serverMessageOrderIdCounter
          });
          this.serverMessageOrderIdCounter++;
        }
      );
      this.store.dispatch(ConsoleActions.addConsoleEntry({entries: entriesToAdd}));
      this.updateModalDialog(entriesToAdd);
    }
  }

  private updateModalDialog(newEntries: ConsoleEntry[]): void {
    if (this.numberOfReceivedLogdataServerMessages > 0) {
      const currentSetting = this.modalDialogFilter$.getValue();
      const filters = currentSetting.map((e) => LOG_LEVEL_TO_FILTER_TEXT.get(e));
      const msgEntriesOfInterest = newEntries.filter(
        e => filters.includes(e.type.trim().toLowerCase()));
      if (msgEntriesOfInterest.length > 0) {
        this.showModalDialog$.next(msgEntriesOfInterest[msgEntriesOfInterest.length - 1].orderMessageId);
      }
    }
    this.numberOfReceivedLogdataServerMessages++;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private updateUserSettings(serverMessage: any): void {
    if (serverMessage.type === MessageTypes.Usersettings) {
      const testOptions: TestOptionSetting[] = serverMessage.payload.testoptions?.map(e => {
        return {
          type: e.name as TestOptionType,
          value: {
            active: e.active,
            value: e.value
          } as TestOptionValue
        } as TestOptionSetting;
      });
      const settings: UserSettings = {
        testOptions,
        logLevel: serverMessage.payload.loglevel as LogLevel,
      };
      this.store.dispatch(UserSettingsActions.setSettings(settings));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleLogfile(serverMessage: any): void {
    if (serverMessage.type === MessageTypes.Logfile) {
      const file = new File([serverMessage.payload.content],
         serverMessage.payload.filename,
         {type: 'text/plain;charset=utf-8'});
      saveAs(file);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private updateConnectionId(serverMessage: any): void {
    if (serverMessage.type === MessageTypes.ConnectionId) {
      const connectionId: string = serverMessage?.payload?.connectionid;
      if (connectionId) {
        this.store.dispatch(ConnectionIdActions.updateConnectionId({connectionid: connectionId}));
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private updateYield(serverMessage: any): void {
    if (serverMessage.type === MessageTypes.Yield && serverMessage.payload) {
      this.store.dispatch(YieldActions.updateYield({yieldData: serverMessage.payload}));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private updateLotData(serverMessage: any): void {
    if (serverMessage.type === MessageTypes.Lotdata && serverMessage.payload) {
      const mirAttributeKeys = Object.keys(STDF_MIR_ATTRIBUTES);
      const mir = new MirRecord();
      // add all defined mir attributes
      mirAttributeKeys.forEach( k => {
        if (serverMessage.payload[k]) {
          mir.values.push({
            key: k,
            value: serverMessage.payload[k]
          });
        }
      });
      this.store.dispatch(LotDataActions.updateLotData({lotData: mir}));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private updateBinTable(serverMessage: any): void {
    if (serverMessage.type === MessageTypes.BinTable && serverMessage.payload) {
      this.store.dispatch(BinTableActions.updateTable({binData: serverMessage.payload}));
    }
  }

  private saveSettings(): void {
    const setting: ModalDialogFilterSetting = {
      modalDialogFilter: this.modalDialogFilter$.getValue()
    };
    this.storage.set(this.getStorageKey(), setting).subscribe(() => true);
  }

  private getStorageKey(): string {
    return `${this?.deviceId ?? ''}${SettingType.ModalDialogFilter}`;
  }

  private updateDeviceId(id: string): void {
    this.deviceId = id;
    this.restoreSettings();
  }

  private restoreSettings(): void {
    this.storage.get(this.getStorageKey())
      .subscribe(e => {
        const modalDialogFilterSetting = e as ModalDialogFilterSetting;
        if (modalDialogFilterSetting && modalDialogFilterSetting.modalDialogFilter && typeof modalDialogFilterSetting.modalDialogFilter.length === 'number') {
          this.modalDialogFilter$.next(
            modalDialogFilterSetting.modalDialogFilter
          );
        } else {
          this.modalDialogFilter$.next(
            [
              LogLevel.Warning,
              LogLevel.Error
            ]
          );
        }
      });
  }

  private subscribeDeviceId(): void {
    this.store.select(selectDeviceId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(e => {
        this.updateDeviceId(e);
      }
    );
  }
}
