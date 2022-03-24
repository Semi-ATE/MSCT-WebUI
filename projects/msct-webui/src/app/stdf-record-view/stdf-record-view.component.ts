import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppstateService } from './../services/appstate.service';
import { CommunicationService } from '../services/communication.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StdfRecordType, StdfRecord } from '../stdf/stdf-stuff';
import { StdfRecordFilterService } from '../services/stdf-record-filter-service/stdf-record-filter.service';
import { SettingType, RecordViewAutoscrollSetting } from '../models/storage.model';
import { Store } from '@ngrx/store';
import { AppState, selectDeviceId } from '../app.state';
import { StorageMap } from '@ngx-pwa/local-storage';
import { ButtonConfiguration } from 'shared';
import { CardConfiguration, CardStyle } from 'shared';
import { CheckboxConfiguration } from 'shared';

enum ButtonType {
  PrevButton,
  NextButton
}

enum RecordUpdateType {
  NewRecordsArrived,
  FilterChanged
}

@Component({
  selector: 'app-stdf-record-view',
  templateUrl: './stdf-record-view.component.html',
  styleUrls: ['./stdf-record-view.component.scss']
})
export class StdfRecordViewComponent implements OnInit, OnDestroy {
  stdfRecordsViewCardConfiguration: CardConfiguration;
  autoscrollCheckboxConfig: CheckboxConfiguration;
  previousRecordButtonConfig: ButtonConfiguration;
  nextRecordButtonConfig: ButtonConfiguration;
  refreshButtonConfig: ButtonConfiguration;

  private currentRecordIndex: [number, number];
  private readonly unsubscribe: Subject<void>;
  private deviceId: string;

  constructor(private readonly communicationService: CommunicationService,
              private readonly filterService: StdfRecordFilterService,
              private readonly appStateService: AppstateService,
              private readonly store: Store<AppState>,
              private readonly storage: StorageMap ) {
    this.initConfigurations();
    this.currentRecordIndex = [0, 0];
    this.unsubscribe = new Subject<void>();
    this.deviceId = undefined;
  }

  ngOnInit(): void {
    this.subscribeFilterService();
    this.stdfRecordsViewCardConfiguration.initCard(false,  CardStyle.COLUMN_STYLE_FOR_COMPONENT, 'Records');
    this.initCheckBoxes();
    this.initButtons();
    this.subscribeDeviceId();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  currentRecord(): StdfRecord {
    return this.filterService.filteredRecords[this.currentRecordIndex[0]]?.[this.currentRecordIndex[1]] ??
      {type: StdfRecordType.Unknown, values: []};
  }

  previousRecord(): void {
    if (this.currentRecordIndex[1] > 0) {
      this.currentRecordIndex[1]--;
    } else if (this.currentRecordIndex[1] === 0) {
      if (this.currentRecordIndex[0] > 0) {
        this.currentRecordIndex[0]--;
        this.currentRecordIndex[1] = this.filterService.filteredRecords[this.currentRecordIndex[0]].length - 1;
      }
    }
    this.setDisabledStatusOfButtons();
  }

  nextRecord(): void {
    if (this.currentRecordIndex[1] < this.filterService.filteredRecords[this.currentRecordIndex[0]].length - 1) {
      this.currentRecordIndex[1]++;
    } else if (this.currentRecordIndex[1] === this.filterService.filteredRecords[this.currentRecordIndex[0]].length - 1) {
      if (this.currentRecordIndex[0] < this.filterService.filteredRecords.length - 1) {
        this.currentRecordIndex[0]++;
        this.currentRecordIndex[1] = 0;
      }
    }
    this.setDisabledStatusOfButtons();
  }

  autoscrollChanged(checked: boolean): void {
    if (checked) {
      if (this.filterService.filteredRecords.length === 0) {
        this.currentRecordIndex = [0, 0];
      } else {
        this.currentRecordIndex[0] = this.filterService.filteredRecords.length - 1;
        this.currentRecordIndex[1] = this.filterService.filteredRecords[this.currentRecordIndex[0]].length - 1;
      }
    }
    this.setDisabledStatusOfButtons();
    this.saveSettings();
  }

  anyRecordStored(): boolean {
    return this.appStateService.stdfRecords.length > 0;
  }

  filterTooStrong(): boolean {
    return this.anyRecordStored() && this.filterService.filteredRecords.length === 0;
  }

  reloadRecords(): void {
    this.communicationService.send({type: 'cmd', command: 'getresults'});
  }

  private subscribeFilterService(): void {
    this.filterService.newResultsAvailable$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({next: () => this.updateView(RecordUpdateType.NewRecordsArrived)});

    this.filterService.resultChanged$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({next: () => this.updateView(RecordUpdateType.FilterChanged)});
  }

  private initConfigurations(): void {
    this.stdfRecordsViewCardConfiguration = new CardConfiguration();
    this.autoscrollCheckboxConfig = new CheckboxConfiguration();
    this.previousRecordButtonConfig = new ButtonConfiguration();
    this.nextRecordButtonConfig = new ButtonConfiguration();
    this.refreshButtonConfig = new ButtonConfiguration();
  }

  private initCheckBoxes(): void {
    this.autoscrollCheckboxConfig.initCheckBox('Autoscroll', true, false);
  }

  private initButtons(): void {
    this.previousRecordButtonConfig.labelText = 'prev';
    this.nextRecordButtonConfig.labelText = 'next';
    this.refreshButtonConfig.initButton('Reload Records', false);
  }

  private setDisabledStatusOfButtons(): void {
    this.previousRecordButtonConfig.disabled = this.buttonDisabled(ButtonType.PrevButton);
    this.nextRecordButtonConfig.disabled = this.buttonDisabled(ButtonType.NextButton);
  }

  private buttonDisabled(buttonType: ButtonType): boolean {
    switch (buttonType) {
      case ButtonType.PrevButton:
        return (this.filterService.filteredRecords.length === 0) || (this.currentRecordIndex[0] === 0 && this.currentRecordIndex[1] === 0);
      case ButtonType.NextButton:
        return (this.filterService.filteredRecords.length === 0) ||
        (this.currentRecordIndex[0] === (this.filterService.filteredRecords.length - 1) &&
        this.currentRecordIndex[1] === (this.filterService.filteredRecords[this.filterService.filteredRecords.length - 1].length - 1));
    }
  }

  private updateView(updateType: RecordUpdateType): void {
    switch (updateType) {
      case RecordUpdateType.FilterChanged:
        if (this.filterService.filteredRecords.length !== 0) {
          this.currentRecordIndex[0] = this.filterService.filteredRecords.length - 1;
          this.currentRecordIndex[1] = this.filterService.filteredRecords[this.currentRecordIndex[0]].length - 1;
        }
        break;
      case RecordUpdateType.NewRecordsArrived:
        if (this.filterService.filteredRecords.length !== 0) {
          if (this.autoscrollCheckboxConfig.checked) {
            this.currentRecordIndex[0] = this.filterService.filteredRecords.length - 1;
            this.currentRecordIndex[1] = this.filterService.filteredRecords[this.currentRecordIndex[0]].length - 1;
          }
        }
        break;
      }
    this.setDisabledStatusOfButtons();
  }

  private restoreSettings(): void {
    this.storage.get(this.getStorageKey())
      .subscribe( e => {
        const autoscrollSetting = e as RecordViewAutoscrollSetting;
        if (autoscrollSetting && typeof autoscrollSetting.enabled === 'boolean') {
          this.autoscrollCheckboxConfig.checked = autoscrollSetting.enabled;
          this.autoscrollChanged(autoscrollSetting.enabled);
        } else {
          this.autoscrollCheckboxConfig.checked = true;
          this.autoscrollChanged(true);
        }
    });
  }

  private saveSettings(): void {
    const setting: RecordViewAutoscrollSetting = {
      enabled: this.autoscrollCheckboxConfig.checked
    };
    this.storage.set(this.getStorageKey(), setting).subscribe( () => true);
  }

  private getStorageKey(): string {
    return `${this.deviceId}${SettingType.RecordViewAutoscroll}`;
  }

  private updateDeviceId(id: string): void {
    this.deviceId = id;
    this.restoreSettings();
  }

  private subscribeDeviceId(): void {
    this.store.select(selectDeviceId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe( e => {
        this.updateDeviceId(e);
      }
    );
  }
}
