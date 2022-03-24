import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ButtonConfiguration, CardConfiguration, CardStyle, InputConfiguration } from 'shared';
import { ElementState, Status } from '../../models/element-status.models';
import { Command, Topic } from '../../models/message.models';
import { WebsocketService } from '../../services/websocket/websocket.service';
import * as fromStoreModels from '../../store/models/store.models';

const PATTERN = /^[1-9][0-9]{5}[.][0-9]{3}$/;
const SUPERVISOR_COMPONENT_NAME = 'Supervisor';

@Component({
  selector: 'app-tcc-lot-handling',
  templateUrl: './tcc-lot-handling.component.html',
  styleUrls: ['./tcc-lot-handling.component.scss']
})
export class TccLotHandlingComponent implements OnInit, OnDestroy {
  lotCardConfiguration: CardConfiguration = new CardConfiguration();
  lotNumberInputConfiguration: InputConfiguration = new InputConfiguration();
  unloadLotButtonConfiguration: ButtonConfiguration = new ButtonConfiguration();
  reloadLotButtonConfiguration: ButtonConfiguration = new ButtonConfiguration();

  private readonly ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private readonly store: Store<fromStoreModels.ComponentFeatureState>,
    private readonly websocketService: WebsocketService) { }

  ngOnInit(): void {
    this.initConfiguration();

    this.store.select(fromStoreModels.featureCommponentsKey)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(e => this.updateSupervisorState(e));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadLot(): void {
    const errorMsg = { errorText: '' };
    if (this.validateLotNumber(errorMsg)) {
      const json = {
        topic: Topic.TopicForSupervisor,
        payload: {
          command: Command.LoadJob,
          payload: {
            job_name: this.lotNumberInputConfiguration.value
          }
        }
      };
      this.sendCommand(json);
      this.lotNumberInputConfiguration.errorMsg = '';
    } else {
      this.lotNumberInputConfiguration.errorMsg = errorMsg.errorText;
    }
  }

  unloadLot(): void {
    const json = {
      topic: Topic.TopicForSupervisor,
      payload: {
        command: Command.UnloadJob,
        payload: {}
      }
    };
    this.sendCommand(json);
  }

  reloadLot(): void {
    const json = {
      topic: Topic.TopicForSupervisor,
      payload: {
        command: Command.ReloadJob,
        payload: {}
      }
    };
    this.sendCommand(json);
  }

  private initConfiguration(): void {
    this.lotCardConfiguration.initCard(true, CardStyle.COLUMN_STYLE, 'Lot Handling');
    this.lotNumberInputConfiguration.initInput('Enter Lot Number', false, '', /([0-9]|\.)/, 'tcc-lot-number-auto');
    this.unloadLotButtonConfiguration.initButton('Unload Lot', false);
    this.reloadLotButtonConfiguration.initButton('Reload Lot', false);
  }

  private validateLotNumber(errorMsg: { errorText: string }): boolean {
    if (PATTERN.test(this.lotNumberInputConfiguration.value as string)) {
      errorMsg.errorText = '';
      return true;
    } else {
      errorMsg.errorText = 'A lot number should be in 6.3 format like \"123456.123\"';
      return false;
    }
  }

  private updateSupervisorState(elementStates: Array<ElementState>): void {
    const supervisor = elementStates?.find(c => c.component.includes(SUPERVISOR_COMPONENT_NAME));
    if (supervisor) {
      this.updateState(supervisor.state);
    }
  }

  private updateState(state: Status): void {
    this.deactivateUserControls();

    if (state === Status.busy) {
      this.unloadLotButtonConfiguration.disabled = false;
      this.reloadLotButtonConfiguration.disabled = false;
    } else if (state === Status.ready) {
      this.lotNumberInputConfiguration.disabled = false;
    }
  }

  private deactivateUserControls(): void {
    this.lotNumberInputConfiguration.disabled = true;
    this.unloadLotButtonConfiguration.disabled = true;
    this.reloadLotButtonConfiguration.disabled = true;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sendCommand(json: any): void {
    this.deactivateUserControls();
    this.websocketService.send(json);
  }
}
