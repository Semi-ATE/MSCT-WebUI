/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { Status } from '../../models/element-status.models';
import { TccState } from '../../store/models/store.models';
import { tccComponentsReducer } from '../../store/reducers/components.reducers';
import { logDataReducer } from '../../store/reducers/logdata.reducers';
import { TccMockServerService } from '../tcc-mock-server/tcc-mock-server.service';
import { WebsocketService } from '../websocket/websocket.service';
import { TccStateService } from './tcc-state.service';

describe('TccStateService', () => {
  let service: TccStateService;
  let mockserverService: TccMockServerService;
  let store: Store<TccState>;
  const messageTopics = {
    TopicForLogging: 'ws/log',
    TopicForTestcellComponent: 'ws/testcellcomponents',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({
          logs: logDataReducer,
          components: tccComponentsReducer
        })
      ]
    });
    mockserverService = TestBed.inject(TccMockServerService);
    TestBed.inject(WebsocketService);
    store = TestBed.inject(Store);
    service = TestBed.inject(TccStateService);
  });

  afterEach(() => {
    mockserverService.ngOnDestroy();
    service.ngOnDestroy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe(messageTopics.TopicForLogging, () => {
    it('should dispatch log data to the store', () => {
      const expectedLogData = [];
      const serverMessage = {
        topic: messageTopics.TopicForLogging,
        payload: {
          entries: expectedLogData
        }
      };

      const dispatchSpy = spyOn(store, 'dispatch').and.callFake(args =>
        args[0] = {
          logData: expectedLogData,
          type: '[LOGDATA] Add'
        });

      (service as any).handleServerMessage(serverMessage);

      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  describe(messageTopics.TopicForTestcellComponent, () => {
    it('should dispatch components to the store', () => {
      const expectedElementStates = [];
      const serverMessage = {
        topic: messageTopics.TopicForTestcellComponent,
        payload: {
          components: expectedElementStates
        }
      };
      const dispatchSpy = spyOn(store, 'dispatch').and.callFake(args =>
        args[0] = {
          components: expectedElementStates,
          type: '[COMPONENTS] Update'
        });

      (service as any).handleServerMessage(serverMessage);

      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  describe('updateElementStates', () => {
    it('should be called when "handleServerMessage" has been called', () => {
      const serverMessage = {
        topic: messageTopics.TopicForTestcellComponent,
        payload: {
          components: [{ component: 'C1', state: Status.error, notices: [] }]
        }
      };

      const spy = spyOn(service as any, 'updateElementStates');

      (service as any).handleServerMessage(serverMessage);

      expect(spy).toHaveBeenCalled();
    });

    it('should update "expectedElementStates"', () => {
      const initialElementState = { component: 'C1', state: Status.starting, notices: [] };
      const expectedElementStates = [];
      const serverMessage = {
        topic: messageTopics.TopicForTestcellComponent,
        payload: {
          components: [
            { component: 'C1', state: Status.error, notices: [] },
            { component: 'C3', state: Status.busy, notices: [] }
          ]
        }
      };

      (service as any).updatedStateInList(0, initialElementState, expectedElementStates);

      expect(expectedElementStates.length).toEqual(1);
      expect(expectedElementStates[0]).toEqual(initialElementState);

      initialElementState.component = 'C2';
      initialElementState.state = Status.crash;

      (service as any).updateElementStates(serverMessage);
      expect(expectedElementStates.push(initialElementState)).toBeTruthy();
    });
  });
});
