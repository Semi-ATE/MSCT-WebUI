import { SiteBinInformationComponent } from './site-bin-information/site-bin-information.component';
import { SystemBinStatusComponent } from './system-bin-status/system-bin-status.component';
import { RouterModule } from '@angular/router';
import { CommunicationService } from './services/communication.service';
import { WebsocketService } from './services/websocket.service';
import { DebugElement } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { SystemStatusComponent } from './system-status/system-status.component';
import { SystemControlComponent } from './system-control/system-control.component';
import { SystemConsoleComponent } from './system-console/system-console.component';
import { TestOptionComponent } from './system-control/test-option/test-option.component';
import * as constants from './services/mockserver-constants';
import { LotHandlingComponent } from './system-control/lot-handling/lot-handling.component';
import { TestExecutionComponent } from './system-control/test-execution/test-execution.component';
import { SystemInformationComponent } from './system-information/system-information.component';
import { MenuComponent } from './menu/menu.component';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { statusReducer } from './reducers/status.reducer';
import { resultReducer } from './reducers/result.reducer';
import { consoleReducer } from './reducers/console.reducer';
import { AppstateService } from './services/appstate.service';
import { userSettingsReducer } from './reducers/usersettings.reducer';
import { YieldComponent } from './yield/yield.component';
import { yieldReducer } from './reducers/yield.reducer';
import { LotDataComponent } from './lot-data/lot-data.component';
import { lotdataReducer } from './reducers/lotdata.reducer';
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';
import { CardComponent, InputComponent } from 'shared';
import { ButtonComponent } from 'shared';
import { CheckboxComponent } from 'shared';
import { InformationComponent } from 'shared';
import { expectWaitUntil, FooterComponent, HeaderComponent, spyOnStoreArguments } from 'shared';
import { MockServerService } from './services/mockserver.service';
import { By } from '@angular/platform-browser';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let debugElement: DebugElement;
  let communicationService: CommunicationService;
  let mockServerService: MockServerService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        SystemStatusComponent,
        SystemControlComponent,
        SystemConsoleComponent,
        SystemInformationComponent,
        CardComponent,
        InputComponent,
        ButtonComponent,
        CheckboxComponent,
        InformationComponent,
        TestOptionComponent,
        LotHandlingComponent,
        TestExecutionComponent,
        MenuComponent,
        SystemBinStatusComponent,
        SiteBinInformationComponent,
        YieldComponent,
        LotDataComponent,
        ModalDialogComponent,
        HeaderComponent,
        FooterComponent
      ],
      providers: [
        WebsocketService,
        CommunicationService,
        AppstateService
      ],
      imports: [
        FormsModule,
        RouterTestingModule,
        RouterModule,
        StoreModule.forRoot({
          systemStatus: statusReducer, // key must be equal to the key define in interface AppState, i.e. systemStatus
          results: resultReducer, // key must be equal to the key define in interface AppState, i.e. results
          consoleEntries: consoleReducer, // key must be equal to the key define in interface AppState, i.e. consoleEntries
          userSettings: userSettingsReducer, // key must be equal to the key define in interface AppState, i.e. userSettings
          yield: yieldReducer,
          lotData: lotdataReducer
        })
      ],
      })
      .compileComponents();
    }));

  beforeEach(() => {
    mockServerService = TestBed.inject(MockServerService);
    communicationService = TestBed.inject(CommunicationService);
    TestBed.inject(AppstateService);

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  afterEach( () => {
    mockServerService.ngOnDestroy();
  });

  it('should create the miniSCT app', () => {
    expect(component).toBeTruthy();
  });

  it('debug component should not be present in release versions', () => {
    const appDebug = fixture.nativeElement.querySelector('app-debug');
    expect(appDebug).toBeFalsy('Please remove any html element having tag "app-debug" manually or any injected MockServerInstance. This component is only used during development');
  });

  it('the mockserver-service should be executed', () => {
    const mockServerElement = document.getElementById(constants.MOCK_SEVER_SERVICE_NEVER_REMOVABLE_ID);
    expect(mockServerElement).toBeTruthy('Mockserver service is running');
  });

  it('should contain an lib-footer tag', () => {
    const componentElement = debugElement.nativeElement.querySelectorAll('lib-footer');
    expect(componentElement).not.toEqual(null);
    expect(componentElement.length).toBe(1);
  });

   describe('Header', () => {
    it('should contain an lib-header tag', () => {
      const componentElement = debugElement.nativeElement.querySelectorAll('lib-header');
      expect(componentElement).not.toEqual(null);
      expect(componentElement.length).toBe(1);
    });

    it('should contain an app-system-status tag', () => {
      const componentElement = debugElement.nativeElement.querySelectorAll('app-system-status');
      expect(componentElement).not.toEqual(null);
      expect(componentElement.length).toBe(1);
    });

    it('should contain an app-menu tag', () => {
      const componentElement = debugElement.nativeElement.querySelectorAll('app-menu');
      expect(componentElement).not.toEqual(null);
      expect(componentElement.length).toBe(1);
    });

    it('should send next command to server when button "Start DUT-Test" has been clicked', async () => {
      // generate ready for DUT Test state
      mockServerService.setRepeatMessages(false);
      mockServerService.setMessages([constants.MESSAGE_WHEN_SYSTEM_STATUS_READY]);

      await expectWaitUntil(
        () => fixture.detectChanges(),
        () => {
          const button = debugElement.queryAll(By.css('lib-button')).find(b => b.nativeElement.innerText.includes('Start DUT-Test'));
          const buttonStyle = getComputedStyle(button.nativeElement);
          if (buttonStyle.display.includes('none'))
            return false;
          return true;
        },
        'Start DUT-Test Button did not appear'
      );

      const args = [];
      spyOnStoreArguments(communicationService, 'send', args);

      debugElement.queryAll(By.css('lib-button'))
        .find(b => b.nativeElement.innerText.includes('Start DUT-Test'))
        .query(By.css('button'))
        .nativeElement.click();

      await expectWaitUntil(
        () => fixture.detectChanges(),
        () => {
          if (args?.[0].type === 'cmd' && args?.[0].command === 'next')
            return true;
          return false;
        },
        'Next command has not been send to the server'
      );
    });

    it('should send reset command to server when button "Reset System" has been clicked', async () => {
      // generate ready for DUT Test state
      mockServerService.setRepeatMessages(false);
      mockServerService.setMessages([constants.MESSAGE_WHEN_SYSTEM_STATUS_SOFTERROR]);

      await expectWaitUntil(
        () => fixture.detectChanges(),
        () => {
          const button = debugElement.queryAll(By.css('lib-button')).find(b => b.nativeElement.innerText.includes('Reset System'));
          const buttonStyle = getComputedStyle(button.nativeElement);
          if (buttonStyle.display.includes('none'))
            return false;
          return true;
        },
        'Reset button did not appear'
      );

      const args = [];
      spyOnStoreArguments(communicationService, 'send', args);

      debugElement.queryAll(By.css('lib-button'))
        .find(b => b.nativeElement.innerText.includes('Reset System'))
        .query(By.css('button'))
        .nativeElement.click();

      await expectWaitUntil(
        () => fixture.detectChanges(),
        () => {
          if (args?.[0].type === 'cmd' && args?.[0].command === 'reset')
            return true;
          return false;
        },
        'Reset command has not been send to the server'
      );
    });
  });
});
