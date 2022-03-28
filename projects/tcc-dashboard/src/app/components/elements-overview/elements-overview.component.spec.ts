/* eslint-disable @typescript-eslint/no-explicit-any */
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { CardComponent, expectWaitUntil, InformationComponent } from 'shared';
import { Status } from '../../models/element-status.models';
import { GET_TEST_CELL_COMPONENTS_COMMAND, TESTCELL_COMPONENTS_ENTRIES } from '../../services/tcc-mock-server/tcc-mock-server-constants';
import { TccMockServerService } from '../../services/tcc-mock-server/tcc-mock-server.service';
import { WebsocketService } from '../../services/websocket/websocket.service';
import { tccComponentsReducer } from '../../store/reducers/components.reducers';
import { ElementStateComponent } from '../element-state/element-state.component';
import { ElementsOverviewComponent } from './elements-overview.component';

describe('ElementsOverviewComponent', () => {
  let component: ElementsOverviewComponent;
  let fixture: ComponentFixture<ElementsOverviewComponent>;
  let debugElement: DebugElement;
  let websocketService: WebsocketService;
  let mockserverService: TccMockServerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ElementsOverviewComponent,
        ElementStateComponent,
        CardComponent,
        InformationComponent
      ],
      providers: [WebsocketService],
      imports: [
        StoreModule.forRoot({
          components: tccComponentsReducer
        })
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    mockserverService = TestBed.inject(TccMockServerService);
    websocketService = TestBed.inject(WebsocketService);
    fixture = TestBed.createComponent(ElementsOverviewComponent);
    debugElement = fixture.debugElement;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockserverService.ngOnDestroy();
    websocketService.ngOnDestroy();
  });

  it('should create test-cell-view component', () => {
    expect(component).toBeTruthy();
  });

  it('should contain an lib-card tag with "Test Cell Components" as label text', () => {
    const appElement = debugElement.nativeElement.querySelectorAll('lib-card');
    expect(appElement).not.toEqual(null);
    expect(appElement.length).toBe(1);
    expect(component.testCellsCardConfiguration.labelText).toBe('Test Cell Components');
  });

  const noActiveTestCellEntryMsg = 'No active test cell component.';
  it(`should show message "${noActiveTestCellEntryMsg}" when there is no active test cell component`, () => {
    expect(component.elementStates.length).toBe(0);

    const messageElement = debugElement.query(By.css('p'));

    expect(messageElement.nativeElement.innerText).toEqual(noActiveTestCellEntryMsg);
  });

  it('should show expected number of elements', () => {
    const elementStates = TESTCELL_COMPONENTS_ENTRIES.payload.components;

    (component as any).updateElementStates(elementStates);
    fixture.detectChanges();

    const testCellElement = debugElement.queryAll(By.css('app-element-state'));

    expect(testCellElement.length).toEqual(3);
  });

  it('should get one test cell component when handleServerMessage is called', () => {
    const message = {
      topic: 'ws/testcellcomponents',
      payload: {
        components: [
          {
            component: 'TCC 1',
            state: 'Starting',
            notices: []
          }
        ]
      }
    };

    (component as any).updateElementStates(message.payload.components);

    expect(component.elementStates.length).toEqual(1);
  });

  it('should update list of components', () => {
    // setup
    component.elementStates = [
      {
        component: 'C1',
        state: Status.ready,
        notices: [
          {
            message: 'C1 is empty',
            priority: 0
          }
        ]
      },
      { component: 'C2', state: Status.ready, notices: [] }
    ];

    // trigger test
    (component as any).updateElementStates([{ component: 'C1', state: Status.error, notices: [] }]);

    // check expected
    expect(component.elementStates.length).toBe(1);
    expect(component.elementStates.find(c => c.component === 'C1').state).toBe(Status.error);
    expect(component.elementStates.find(c => c.component === 'C1').notices.length).toBe(0);
  });

  it('should get message from observable', async () => {
    let called = false;
    const subscription = websocketService.messageSubject.subscribe(() => called = true);

    websocketService.send(GET_TEST_CELL_COMPONENTS_COMMAND);

    await expectWaitUntil(
      null,
      () => called,
      'No message has been received'
    );

    subscription.unsubscribe();
  });
});
