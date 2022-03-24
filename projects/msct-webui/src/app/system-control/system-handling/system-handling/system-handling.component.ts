import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { CardConfiguration, CardStyle } from 'shared';
import { DropdownConfiguration } from 'shared';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppState } from './../../../app.state';
import { LogLevel, UserSettings } from './../../../models/usersettings.model';
import { CommunicationService } from './../../../services/communication.service';

@Component({
  selector: 'app-system-handling',
  templateUrl: './system-handling.component.html',
  styleUrls: ['./system-handling.component.scss']
})
export class SystemHandlingComponent implements OnInit, OnDestroy {

  setLogLevelDropdownConfig: DropdownConfiguration;
  logLevelCardConfiguration: CardConfiguration;
  private readonly ngUnsubscribe: Subject<void>;

  constructor(private readonly store: Store<AppState>, private readonly communicationService: CommunicationService) {
    this.setLogLevelDropdownConfig = new DropdownConfiguration();
    this.logLevelCardConfiguration = new CardConfiguration();
    this.ngUnsubscribe = new Subject<void>();
  }

  ngOnInit(): void {
    this.logLevelCardConfiguration.initCard(true,  CardStyle.COLUMN_STYLE, 'System Loglevel');
    this.initLogLevel();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  setLogLevel(): void {
    this.communicationService.send({type: 'cmd', command: 'setloglevel', level: this.setLogLevelDropdownConfig.value});
  }

  private initLogLevel(): void {
    this.setLogLevelDropdownConfig.initDropdown('', false, [
      {description: 'Debug', value: LogLevel.Debug},
      {description: 'Info', value: LogLevel.Info},
      {description: 'Warning', value: LogLevel.Warning},
      {description: 'Error', value: LogLevel.Error}
    ], 2);

    this.store.select('userSettings')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(e => this.updateLogLevel(e));
  }

  private updateLogLevel(settings: UserSettings): void {
    const index = this.setLogLevelDropdownConfig.items.findIndex(e => e.value === settings.logLevel);
    if (index >= 0) {
      this.setLogLevelDropdownConfig.selectedIndex = index;
    }
  }
}
