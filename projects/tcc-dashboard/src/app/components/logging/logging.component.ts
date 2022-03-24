import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CardConfiguration, CardStyle, TabConfiguration } from 'shared';
import { LogDataEntry } from '../../models/logdata.models';
import { LOG_COMMAND_SENT_TO_SERVER } from '../../services/tcc-mock-server/tcc-mock-server-constants';
import { WebsocketService } from '../../services/websocket/websocket.service';
import * as fromStoreModels from '../../store/models/store.models';

@Component({
  selector: 'app-logging',
  templateUrl: './logging.component.html',
  styleUrls: ['./logging.component.scss']
})
export class LoggingComponent implements OnInit, OnDestroy {
  title = 'Tcc Dashboard';
  logData: Array<LogDataEntry> = [];
  logDataCardConfiguration: CardConfiguration = new CardConfiguration();
  logDataTabConfiguration: TabConfiguration = new TabConfiguration();
  private readonly ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private readonly store: Store<fromStoreModels.LogFeatureState>,
    private readonly websocketService: WebsocketService,
  ) { }

  ngOnInit(): void {
    this.logDataCardConfiguration.initCard(false, CardStyle.COLUMN_STYLE_FOR_COMPONENT, 'Logging');

    this.websocketService.send(LOG_COMMAND_SENT_TO_SERVER);

    this.store.select(fromStoreModels.featureLogsKey)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(e => this.updateLogEntries(e));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private updateLogEntries(entries: Array<LogDataEntry>): void {
    this.logData = entries;
  }
}
