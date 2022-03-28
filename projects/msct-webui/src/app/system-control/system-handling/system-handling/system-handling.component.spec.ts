import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SystemHandlingComponent } from './system-handling.component';
import { By } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { MockServerService } from '../../../services/mockserver.service';
import { consoleReducer } from '../../../reducers/console.reducer';
import { resultReducer } from '../../../reducers/result.reducer';
import { statusReducer } from '../../../reducers/status.reducer';
import { userSettingsReducer } from '../../../reducers/usersettings.reducer';
import { yieldReducer } from '../../../reducers/yield.reducer';
import { AppstateService } from '../../../services/appstate.service';
import { MessageTypes } from '../../../services/types';
import { CommunicationService } from '../../../services/communication.service';
import { LogLevel } from '../../../models/usersettings.model';
import { CardComponent } from 'shared';
import { DropdownComponent } from 'shared';
import { expectWaitUntil, spyOnStoreArguments } from 'shared';

describe('SystemHandlingComponent', () => {
  let component: SystemHandlingComponent;
  let fixture: ComponentFixture<SystemHandlingComponent>;
  let debugElement: DebugElement;
  let mockServerService: MockServerService;
  let communicationService: CommunicationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DropdownComponent,
        CardComponent,
        SystemHandlingComponent
      ],
      imports: [
        StoreModule.forRoot({
          systemStatus: statusReducer, // key must be equal to the key define in interface AppState, i.e. systemStatus
          results: resultReducer, // key must be equal to the key define in interface AppState, i.e. results
          consoleEntries: consoleReducer, // key must be equal to the key define in interface AppState, i.e. consoleEntries
          userSettings: userSettingsReducer, // key must be equal to the key define in interface AppState, i.e. userSettings
          yield: yieldReducer
        }),
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    mockServerService = TestBed.inject(MockServerService);
    communicationService = TestBed.inject(CommunicationService);
    TestBed.inject(AppstateService);
    fixture = TestBed.createComponent(SystemHandlingComponent);
    debugElement = fixture.debugElement;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach( () => {
    mockServerService.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update log level setting accroding to server message', async () => {
    const msgFromServer = {
      type: MessageTypes.Usersettings,
      payload: {
        loglevel: LogLevel.Debug
      }
    };
    mockServerService.setMessages([msgFromServer]);
    let expectedSelectedIndex = component.setLogLevelDropdownConfig.items.findIndex(e => e.value === msgFromServer.payload.loglevel);

    await expectWaitUntil(
      () => fixture.detectChanges(),
      () => component.setLogLevelDropdownConfig.selectedIndex === expectedSelectedIndex,
      'Dropdown element for setting the loglevel did not update selected index. It should be: ' + expectedSelectedIndex
    );

    msgFromServer.payload.loglevel = LogLevel.Error;
    mockServerService.setMessages([msgFromServer]);
    expectedSelectedIndex = component.setLogLevelDropdownConfig.items.findIndex(e => e.value === msgFromServer.payload.loglevel);

    await expectWaitUntil(
      () => fixture.detectChanges(),
      () => component.setLogLevelDropdownConfig.selectedIndex === expectedSelectedIndex,
      'Dropdown element for setting the loglevel did not update selected idex. It should be: ' + expectedSelectedIndex
    );
  });

  it('should send new loglevel to the server', async () => {
    const args = [];
    spyOnStoreArguments(communicationService, 'send', args);

    debugElement.query(By.css('lib-dropdown li.selected')).nativeElement.click();

    await expectWaitUntil(
      () => fixture.detectChanges(),
      () => debugElement.query(By.css('.closed')) === null,
      'Dropdown did not open');


     debugElement.queryAll(By.css('lib-dropdown li'))
      .find(e => e.nativeElement.innerText.includes('Error'))
      .nativeElement.click();

    await expectWaitUntil(
      () => fixture.detectChanges(),
      () => args.some(e => e.type === 'cmd' && e.command === 'setloglevel' && e.level === LogLevel.Error),
      'Command setloglevel was not send to server.');
  });
});
