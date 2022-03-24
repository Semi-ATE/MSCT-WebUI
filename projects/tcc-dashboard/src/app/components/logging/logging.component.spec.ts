import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { ButtonComponent, CardComponent, expectWaitUntil, InputComponent } from 'shared';
import { LOG_COMMAND_SENT_TO_SERVER } from '../../services/tcc-mock-server/tcc-mock-server-constants';
import { TccMockServerService } from '../../services/tcc-mock-server/tcc-mock-server.service';
import { WebsocketService } from '../../services/websocket/websocket.service';
import { TccLotHandlingComponent } from '../tcc-lot-handling/tcc-lot-handling.component';
import { LoggingComponent } from './logging.component';
import { logDataReducer } from '../../store/reducers/logdata.reducers';
import { TccStateService } from '../../services/tcc-state/tcc-state.service';

describe('LoggingComponent', () => {
  let component: LoggingComponent;
  let fixture: ComponentFixture<LoggingComponent>;
  let debugElement: DebugElement;
  let websocketService: WebsocketService;
  let mockserverService: TccMockServerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        LoggingComponent,
        CardComponent,
        TccLotHandlingComponent,
        InputComponent,
        ButtonComponent
      ],
      imports: [
        FormsModule,
        StoreModule.forRoot({
          logs: logDataReducer
        })
      ],
      providers: [
        WebsocketService
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    mockserverService = TestBed.inject(TccMockServerService);
    websocketService = TestBed.inject(WebsocketService);
    fixture = TestBed.createComponent(LoggingComponent);
    TestBed.inject(TccStateService);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockserverService.ngOnDestroy();
    websocketService.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain an lib-card tag', () => {
    const appElement = debugElement.nativeElement.querySelectorAll('lib-card');
    expect(appElement).not.toEqual(null);
    expect(appElement.length).toBe(2);
  });

  const expectedTableHeaders = ['Type', 'Date and Time', 'Source', 'Description'];
  it(`should show a table with the following columns: '${expectedTableHeaders}'`, () => {
    const currentTableHeaders = [];
    const thElement = debugElement.queryAll(By.css('table th'));

    thElement.forEach(e => currentTableHeaders.push(e.nativeElement.innerText));
    expect(currentTableHeaders).toEqual(jasmine.arrayWithExactContents(expectedTableHeaders));
  });

  it('should get message from observable', async () => {
    let called = false;
    const subscription = websocketService.messageSubject.subscribe(() => called = true);

    websocketService.send(LOG_COMMAND_SENT_TO_SERVER);

    await expectWaitUntil(
      null,
      () => called,
      'No message has been received'
    );

    subscription.unsubscribe();
  });
});
