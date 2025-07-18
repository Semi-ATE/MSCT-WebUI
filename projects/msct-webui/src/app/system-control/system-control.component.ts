import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from './../app.state';
import { Status, SystemState } from './../models/status.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppstateService, FILTER_TEXT_TO_LOG_LEVEL, LOG_LEVEL_TO_FILTER_TEXT } from '../services/appstate.service';
import { LogLevel } from '../models/usersettings.model';
import { CardConfiguration, CardStyle } from 'shared';
import { initMultichoiceEntry, MultichoiceConfiguration } from 'shared';
@Component({
  selector: 'app-system-control',
  templateUrl: './system-control.component.html',
  styleUrls: ['./system-control.component.scss']
})

export class SystemControlComponent implements OnInit, OnDestroy {
  systemControlCardConfiguration: CardConfiguration;
  systemMessageCardConfiguration: CardConfiguration;
  modalDialogFilterConfig: MultichoiceConfiguration;

  private status: Status;
  private readonly ngUnsubscribe: Subject<void>; // needed for unsubscribing an preventing memory leaks

  constructor(
    private readonly appStateService: AppstateService,
    private readonly store: Store<AppState>,
  ) {
    this.systemControlCardConfiguration = new CardConfiguration();
    this.systemMessageCardConfiguration = new CardConfiguration();
    this.ngUnsubscribe = new Subject<void>();
    this.modalDialogFilterConfig = {
      readonly: false,
      items: [
        initMultichoiceEntry('Debug', false, '#0046AD', 'white'),
        initMultichoiceEntry('Info', false, '#0046AD', 'white'),
        initMultichoiceEntry('Warning', true, '#0046AD', 'white'),
        initMultichoiceEntry('Error', true, '#0046AD', 'white')
      ],
      label: ''
    };
  }

  ngOnInit(): void {
    this.initConfiguration();
    this.store.select('systemStatus')
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(s => this.status = s);

    this.appStateService.modalDialogFilter$
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe( m => this.applyModalFilterSetting(m));
  }

  ngOnDestroy(): void {
    // preventing possible memory leaks
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  renderSystemControlComponent(): boolean {
    return this.status.state !== SystemState.error;
  }

  setModalDialogFilter(): void {
    const modalDialogFilterSetting = this.modalDialogFilterConfig
      .items.filter(e => e.checked)
      .map(e => FILTER_TEXT_TO_LOG_LEVEL.get(e.label.toLowerCase()));
    this.appStateService.setModalDialogFilter(modalDialogFilterSetting);
  }

  private applyModalFilterSetting(levels: Array<LogLevel>): void {
    const levelsAsText = levels.map(e => LOG_LEVEL_TO_FILTER_TEXT.get(e));
    this.modalDialogFilterConfig.items = this.modalDialogFilterConfig.items.map(i => {
      i.checked = levelsAsText.includes(i.label.toLowerCase());
      return i;
    });
  }

  private initConfiguration(): void {
    this.systemControlCardConfiguration.cardStyle = CardStyle.COLUMN_STYLE_FOR_COMPONENT;
    this.systemControlCardConfiguration.labelText = 'Control';
    this.systemMessageCardConfiguration.initCard(true, CardStyle.COLUMN_STYLE, 'System Message');
  }
}
