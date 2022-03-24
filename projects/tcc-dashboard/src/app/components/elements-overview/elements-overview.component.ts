import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CardConfiguration, CardStyle, TabConfiguration } from 'shared';
import { ElementState } from '../../models/element-status.models';
import { GET_TEST_CELL_COMPONENTS_COMMAND } from '../../services/tcc-mock-server/tcc-mock-server-constants';
import { WebsocketService } from '../../services/websocket/websocket.service';
import * as fromStoreModels from '../../store/models/store.models';

@Component({
  selector: 'app-elements-overview',
  templateUrl: './elements-overview.component.html',
  styleUrls: ['./elements-overview.component.scss']
})
export class ElementsOverviewComponent implements OnInit, OnDestroy {
  elementStates: Array<ElementState> = [];
  testCellsCardConfiguration: CardConfiguration = new CardConfiguration();
  testCellsTabConfiguration: TabConfiguration = new TabConfiguration();
  private readonly ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private readonly store: Store<fromStoreModels.ComponentFeatureState>,
    private readonly websocketService: WebsocketService) { }

  ngOnInit(): void {
    this.testCellsCardConfiguration.initCard(false, CardStyle.COLUMN_STYLE_FOR_COMPONENT, 'Test Cell Components');
    this.websocketService.send(GET_TEST_CELL_COMPONENTS_COMMAND);

    this.store.select(fromStoreModels.featureCommponentsKey)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(e => this.updateElementStates(e));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private updateElementStates(updateState: Array<ElementState>): void {
    this.elementStates = updateState;
  }
}
