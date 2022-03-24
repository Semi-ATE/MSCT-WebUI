import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { ButtonConfiguration } from 'shared';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppState } from './app.state';
import { Status, SystemState } from './models/status.model';
import { AppstateService } from './services/appstate.service';
import { CommunicationService } from './services/communication.service';
import { BACKEND_MOCKED } from './constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {
  appTitle: string;
  startDutTestButtonConfig: ButtonConfiguration;
  resetButtonConfig: ButtonConfiguration;
  status$: Observable<Status>;
  readonly backendMocked = BACKEND_MOCKED;

  private status: Status;
  private readonly ngUnsubscribe: Subject<void>;


  constructor(
    private readonly communicationService: CommunicationService,
    private readonly store: Store<AppState>,
    readonly stateService: AppstateService) {
      this.appTitle = 'MiniSCT';
      this.startDutTestButtonConfig = new ButtonConfiguration();
      this.resetButtonConfig = new ButtonConfiguration();
      this.ngUnsubscribe = new Subject<void>();

      this.store.select('systemStatus')
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe( s => this.updateStatus(s));
  }

  ngOnInit(): void {
    this.startDutTestButtonConfig.initButton('Start DUT-Test', false);
    this.resetButtonConfig.initButton('Reset System', false);

    this.status$ = this.store.pipe(select('systemStatus'));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  startDutTest(): void {
    this.communicationService.send({type: 'cmd', command: 'next'});
  }

  resetSystem(): void {
    this.communicationService.send({type: 'cmd', command: 'reset'});
  }

  isStartDutTestButtonInvisible(): boolean {
    switch (this.status.state) {
      case SystemState.ready:
        return false;
    }
    return true;
  }

  isResetButtonInvisible(): boolean {
    switch (this.status.state) {
      case SystemState.softerror:
      return false;
    }
    return true;
  }

  private updateStatus(status: Status): void {
    this.status = status;
  }
}

