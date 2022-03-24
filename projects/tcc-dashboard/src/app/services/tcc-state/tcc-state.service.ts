import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LogDataEntry } from '../../models/logdata.models';
import { LoggingMessage, TestCellMessage, Topic } from '../../models/message.models';
import { TccState } from '../../store/models/store.models';
import { WebsocketService } from './../websocket/websocket.service';
import * as LogdataActions from './../../store/actions/logdata.actions';
import { ElementState } from '../../models/element-status.models';
import * as TccComponentsActions from './../../store/actions/components.actions';

@Injectable({
  providedIn: 'root'
})
export class TccStateService implements OnDestroy {
  websocketErrorSubject$: BehaviorSubject<boolean>;
  private readonly subscriptionConnection: Subscription;

  constructor(
    private readonly store: Store<TccState>,
    private readonly webSocketService: WebsocketService
  ) {
    this.subscriptionConnection = this.webSocketService.messageSubject.subscribe(msg => this.handleServerMessage(msg));
    this.websocketErrorSubject$ = webSocketService.websocketErrorSubject$;
  }

  ngOnDestroy(): void {
    this.subscriptionConnection.unsubscribe();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleServerMessage(serverMessage: any): void {
    this.updateLogData(serverMessage);
    this.updateElementStates(serverMessage);
  }

  private updateLogData(serverMessage: LoggingMessage): void {
    if (serverMessage.topic === Topic.TopicForLogging) {
      const logentriesToAdd: Array<LogDataEntry> = [];

      serverMessage.payload.entries.map(
        e => {
          logentriesToAdd.push({
            type: this.extractPattern(e)[0],
            time: this.extractPattern(e)[1],
            source: this.extractPattern(e)[2],
            info: this.extractPattern(e)[3]
          });
        }
      );
      this.store.dispatch(LogdataActions.addLogData({ logData: logentriesToAdd }));
    }
  }

  private extractPattern(value: string): Array<string> {
    const splittedlogData = [];
    value.split('|').filter(e => e !== '').map(e => {
      splittedlogData.push(e.trim());
    });
    return splittedlogData;
  }

  private updateElementStates(serverMessage: TestCellMessage): void {
    if (serverMessage.topic === Topic.TopicForTestcellComponent) {
      const elementStates: Array<ElementState> = [];

      serverMessage.payload.components.forEach(e => {
        const index = elementStates.findIndex(s => s.component === e.component);
        (index >= 0)? this.updatedStateInList(index, e, elementStates): elementStates.push(e);
      });
      this.store.dispatch(TccComponentsActions.updateComponents({ components: elementStates }));
    }
  }

  private updatedStateInList(listIndex: number, updateState: ElementState, elementStates: Array<ElementState>): void {
    elementStates[listIndex] = updateState;
  }
}
