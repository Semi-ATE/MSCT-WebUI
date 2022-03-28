import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommunicationService } from './../../services/communication.service';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { AppState } from '../../app.state';
import { Status, SystemState } from '../../models/status.model';
import { ButtonConfiguration } from 'shared';
import { CardConfiguration, CardStyle } from 'shared';

@Component({
  selector: 'app-test-execution',
  templateUrl: './test-execution.component.html',
  styleUrls: ['./test-execution.component.scss']
})
export class TestExecutionComponent implements OnInit, OnDestroy {
  testExecutionControlCardConfiguration: CardConfiguration;
  startDutTestButtonConfig: ButtonConfiguration;

  private status: Status;
  private readonly ngUnsubscribe: Subject<void>; // needed for unsubscribing an preventing memory leaks

  constructor(private readonly communicationService: CommunicationService, private readonly store: Store<AppState>) {
    this.testExecutionControlCardConfiguration = new CardConfiguration();
    this.startDutTestButtonConfig = new ButtonConfiguration();
    this.ngUnsubscribe = new Subject<void>();
  }

  ngOnInit(): void {
    this.startDutTestButtonConfig.labelText = 'Start DUT-Test';
    this.testExecutionControlCardConfiguration.initCard(true,  CardStyle.COLUMN_STYLE, 'Test Execution');
    this.store.select('systemStatus')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(s => this.updateStatus(s));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private updateStatus(status: Status): void {
    this.status = status;
    this.updateButtonConfigs();
  }

  private updateButtonConfigs(): void {
    this.startDutTestButtonConfig.disabled = this.status.state !== SystemState.ready;
    this.startDutTestButtonConfig = Object.assign({}, this.startDutTestButtonConfig);
  }

  startDutTest(): void {
    this.communicationService.send({type: 'cmd', command: 'next'});
  }
}
