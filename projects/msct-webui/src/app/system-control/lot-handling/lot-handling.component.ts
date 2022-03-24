import { Component, OnInit, OnDestroy } from '@angular/core';
import { InputConfiguration } from 'shared';
import { CommunicationService } from './../../services/communication.service';
import { Status, SystemState } from './../../models/status.model';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from './../../app.state';
import { takeUntil } from 'rxjs/operators';
import * as ResultActions from './../../actions/result.actions';
import { AppstateService } from './../../services/appstate.service';
import { ButtonConfiguration } from 'shared';
import { CardConfiguration, CardStyle } from 'shared';

@Component({
  selector: 'app-lot-handling',
  templateUrl: './lot-handling.component.html',
  styleUrls: ['./lot-handling.component.scss']
})
export class LotHandlingComponent implements OnInit, OnDestroy {
  lotCardConfiguration: CardConfiguration;
  lotNumberInputConfig: InputConfiguration;
  unloadLotButtonConfig: ButtonConfiguration;

  private status: Status;
  private readonly ngUnsubscribe: Subject<void>; // needed for unsubscribing an preventing memory leaks

  constructor(private readonly communicationService: CommunicationService, private readonly store: Store<AppState>, private readonly appStateService: AppstateService) {
    this.lotCardConfiguration = new CardConfiguration();
    this.lotNumberInputConfig = new InputConfiguration();
    this.unloadLotButtonConfig = new ButtonConfiguration();
    this.ngUnsubscribe = new Subject<void>();
  }

  ngOnInit(): void {
    this.unloadLotButtonConfig.labelText = 'Unload Lot';
    this.lotNumberInputConfig.initInput('Enter Lot Number', false, '', /^[1-9][0-9]{5}[.][0-9]{3}$/);
    this.lotCardConfiguration.initCard(true, CardStyle.COLUMN_STYLE, 'Lot Handling');
    this.store.select('systemStatus')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(s => this.updateStatus(s));

    this.updateButtonConfigs();
    this.updateInputConfigs();
  }

  ngOnDestroy(): void {
    // preventing possible memory leaks
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadLot(): void {
    const errorMsg = { errorText: '' };
    if (this.validateLotNumber(errorMsg)) {
      this.communicationService.send(
        {
          type: 'cmd',
          command: 'load',
          lot_number: this.lotNumberInputConfig.value
        });
      this.lotNumberInputConfig.errorMsg = '';
      this.store.dispatch(ResultActions.clearResult());
      this.clearStoredStdfRecords();
    } else {
      this.lotNumberInputConfig.errorMsg = errorMsg.errorText;
    }
  }

  unloadLot(): void {
    this.communicationService.send({ type: 'cmd', command: 'unload' });
  }

  private clearStoredStdfRecords(): void {
    this.appStateService.clearStdfRecords();
    this.store.dispatch(ResultActions.clearResult());
  }

  private updateStatus(status: Status): void {
    this.status = status;
    this.updateInputConfigs();
    this.updateButtonConfigs();
    this.lotNumberInputConfig.autocompleteId = `${this.status.deviceId}HistoryOfTypedInLotNumbers'`;
  }

  private updateInputConfigs(): void {
    this.lotNumberInputConfig.disabled = this.status.state !== SystemState.initialized;
    if (this.status.state === SystemState.ready || this.status.state === SystemState.loading || this.status.state === SystemState.paused || this.status.state === SystemState.testing) {
      this.lotNumberInputConfig.value = this.status.lotNumber;
    }
    this.lotNumberInputConfig.validCharacterRegexp = /([0-9]|\.)/;
    this.lotNumberInputConfig = Object.assign({}, this.lotNumberInputConfig);
  }

  private updateButtonConfigs(): void {
    this.unloadLotButtonConfig.disabled = this.status.state !== SystemState.ready;
    this.unloadLotButtonConfig = Object.assign({}, this.unloadLotButtonConfig);
  }

  private validateLotNumber(errorMsg: { errorText: string }): boolean {
    const pattern = /^[1-9][0-9]{5}[.][0-9]{3}$/;

    if (pattern.test(this.lotNumberInputConfig.value as string)) {
      errorMsg.errorText = '';
      return true;
    } else {
      errorMsg.errorText = 'A lot number should be in 6.3 format like \"123456.123\"';
      return false;
    }
  }
}
