/* eslint-disable @typescript-eslint/no-explicit-any */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { TestOptionComponent, TestOption, TestOptionLabelText } from './test-option.component';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { MockServerService } from '../../services/mockserver.service';
import { SystemState } from '../../models/status.model';
import { TestOptionType } from '../../models/usersettings.model';
import { consoleReducer } from '../../reducers/console.reducer';
import { resultReducer } from '../../reducers/result.reducer';
import { statusReducer } from '../../reducers/status.reducer';
import { userSettingsReducer } from '../../reducers/usersettings.reducer';
import { AppstateService } from '../../services/appstate.service';
import { CommunicationService } from '../../services/communication.service';
import { ButtonComponent, InputComponent } from 'shared';
import { CardComponent } from 'shared';
import { CheckboxComponent } from 'shared';
import { expectWaitUntil, spyOnStoreArguments } from 'shared';

describe('TestOptionComponent', () => {
  let component: TestOptionComponent;
  let fixture: ComponentFixture<TestOptionComponent>;
  let debugElement: DebugElement;
  let mockServerService: MockServerService;
  let communicationService: CommunicationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestOptionComponent,
        ButtonComponent,
        CheckboxComponent,
        InputComponent,
        CardComponent
      ],
      imports: [
        FormsModule,
        StoreModule.forRoot({
          systemStatus: statusReducer, // key must be equal to the key define in interface AppState, i.e. systemStatus
          results: resultReducer, // key must be equal to the key define in interface AppState, i.e. results
          consoleEntries: consoleReducer, // key must be equal to the key define in interface AppState, i.e. consoleEntries
          userSettings: userSettingsReducer // key must be equal to the key define in interface AppState, i.e. userSettings
        })
      ],
      schemas: []
    })
      .compileComponents();
  }));

  beforeEach(() => {
    mockServerService = TestBed.inject(MockServerService);
    TestBed.inject(AppstateService);
    communicationService = TestBed.inject(CommunicationService);
    fixture = TestBed.createComponent(TestOptionComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  afterEach( () => {
    mockServerService.ngOnDestroy();
  });

  it('should create test-option component', () => {
    expect(component).toBeTruthy();
  });

  it('should create instance of TestOption', () => {
    const type = TestOptionType.stopOnFail;
    expect(new TestOption(type)).toBeTruthy();
    expect(new TestOption(type).type).toBe(type);
  });

  describe('Class TestOption', () => {
    it('should change values from onChange() when checked element is true ', () => {
      const testOption = new TestOption(TestOptionType.stopOnFail);
      const checked = true;
      testOption.onChange(checked);

      expect(testOption.toBeAppliedValue.active).toBe(true);
      expect(testOption.inputConfig.disabled).toBe(false);
    });

    it('should get true value from haveToApply() when some change occured', () => {
      const testOption = new TestOption(TestOptionType.triggerOnFailure);
      let anyChanges = false;
      if (testOption.toBeAppliedValue.active !== testOption.currentValue.active) {
        anyChanges = true;
      }

      expect(testOption.haveToApply()).toEqual(anyChanges);
    });

  });

  it('should show apply- and reset-button', () => {
    const buttonLabels = debugElement.queryAll(By.css('button')).map(b => b.nativeElement.innerText);
    expect(buttonLabels).toEqual(jasmine.arrayWithExactContents([TestOptionLabelText.apply, TestOptionLabelText.reset]));
  });

  it('should show the test options stored in array testOptions', () => {
    const checkboxLabels = debugElement
      .queryAll(By.css('lib-checkbox label'))
      .filter(e => !e.classes.toggle)
      .map(e => e.nativeElement.innerText);
    expect(checkboxLabels).toEqual(jasmine.arrayWithExactContents(((component as any).testOptions as TestOption[]).map(o => o.checkboxConfig.labelText)));
  });

  it('should call method resetTestOptions when reset button clicked', () => {

    // update the status of this component
    (component as any).updateStatus({
      deviceId: 'MiniSCT',
      env: 'Environment',
      handler: 'Handler',
      time: '1st July 2020, 19:45:03',
      sites: ['A'],
      program: '',
      log: '',
      state: SystemState.ready,
      reason: '',
    });

    fixture.detectChanges();
    const checkboxes = fixture.debugElement.queryAll(By.css('lib-checkbox'));
    const checkbox = checkboxes.filter(e => e.nativeElement.innerText === 'Stop on Fail')[0].nativeElement.querySelector('.slider');

    checkbox.click();
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('lib-button'));
    const resetButton = buttons.filter(e => e.nativeElement.innerText === 'Reset')[0].nativeElement.querySelector('button');

    const spy = spyOn(component, 'resetTestOptions');
    resetButton.click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
  });

  it('should update test options when received user settings from server', async () => {

    function checkTestOption(testOption: TestOption, active: boolean, value?: number): boolean {
      if( testOption.checkboxConfig.checked === active ) {
        if (testOption.currentValue.active === active) {
          if (value || value > 0) {
            if (testOption.currentValue.value === value) {
              if (testOption.inputConfig.value === value.toString()) {
                return true;
              }
            }
          } else {
            return true;
          }
        }
      }
      return false;
    }

    const settingsFromServer = {
      type: 'usersettings',
      payload: {
        testoptions: [
          {
            name: TestOptionType.stopOnFail,
            active: true,
            value: -1,
          },
          {
            name: TestOptionType.stopAtTestNumber,
            active: false,
            value: 4
          },
          {
            name: TestOptionType.triggerSiteSpecific,
            active: true,
            value: -1
          },
        ]
      }
    };

    mockServerService.setRepeatMessages(false);
      mockServerService.setMessages([
        settingsFromServer
      ]
    );

    await expectWaitUntil(
      () => fixture.detectChanges(),
      () => {
        if (checkTestOption(component.stopAtTestNumberOption, false, 4)) {
          if (checkTestOption(component.stopOnFailOption, true)) {
            if (checkTestOption(component.triggerSiteSpecificOption, true)) {
              return true;
            }
          }
        }
        return false;
      },
      'Expected test option settings did not load',
      200,
      3000
    );
  });

  describe('Option: Stop-On-Fail', () => {

    it('should display "Stop on Fail"', () => {
      expect(component.stopOnFailOption.checkboxConfig.labelText).toContain('Stop on Fail');
    });

    it('should be disabled when system is initialized', () => {
      // update the status of this component
      (component as any).updateStatus({
        deviceId: 'MiniSCT',
        env: 'Environment',
        handler: 'Handler',
        time: '1st July 2020, 19:45:03',
        sites: ['A'],
        program: '',
        log: '',
        state: SystemState.initialized,
        reason: '',
      });
      fixture.detectChanges();
      const checkboxes = fixture.debugElement.queryAll(By.css('lib-checkbox'));
      const checkbox = checkboxes.find(e => e.nativeElement.innerText === 'Stop on Fail');
      expect(checkbox.query(By.css('.disabled'))).toBeDefined();
    });

    it('should be active when system state is ready', () => {

      // update the status of this component
      (component as any).updateStatus({
        deviceId: 'MiniSCT',
        env: 'Environment',
        handler: 'Handler',
        time: '1st July 2020, 19:45:03',
        sites: ['A'],
        program: 'Loaded Program Name',
        log: '',
        state: SystemState.ready,
        reason: '',
      });
      fixture.detectChanges();

      const checkboxes = fixture.debugElement.queryAll(By.css('lib-checkbox'));
      const checkbox = checkboxes.find(e => e.nativeElement.innerText === 'Stop on Fail');
      expect(checkbox.query(By.css('.disabled'))).toBeNull();
    });

    it('should call sendOptionsToServer method when apply button clicked', () => {
      // update the status of this component
      (component as any).updateStatus({
        deviceId: 'MiniSCT',
        env: 'Environment',
        handler: 'Handler',
        time: '1st July 2020, 19:45:03',
        sites: ['A'],
        program: '',
        log: '',
        state: SystemState.ready,
        reason: '',
      });
      fixture.detectChanges();

      const checkboxes = fixture.debugElement.queryAll(By.css('lib-checkbox'));
      const checkbox = checkboxes.filter(e => e.nativeElement.innerText === 'Stop on Fail')[0].nativeElement.querySelector('.slider');

      checkbox.click();
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('lib-button'));
      const applyButton = buttons.filter(e => e.nativeElement.innerText === 'Apply')[0].nativeElement.querySelector('button');

      const spy = spyOn(component, 'sendOptionsToServer');
      applyButton.click();

      fixture.detectChanges();
      expect(spy).toHaveBeenCalled();
    });

    it('should pass send options to the send function of the communication service', () => {
      // update the status of this component
      (component as any).updateStatus({
        deviceId: 'MiniSCT',
        env: 'Environment',
        handler: 'Handler',
        time: '1st July 2020, 19:45:03',
        sites: ['A'],
        program: '',
        log: '',
        state: SystemState.ready,
        reason: '',
      });
      fixture.detectChanges();

      // configure stop on fail option
      const checkboxes = fixture.debugElement.queryAll(By.css('lib-checkbox'));
      const checkbox = checkboxes.filter(e => e.nativeElement.innerText === 'Stop on Fail')[0].nativeElement.querySelector('.slider');
      checkbox.click();
      fixture.detectChanges();

      // spy on send function of the communication service
      // and store received arguments to check them later
      const communicationServiceRetrievedSendArgument = [];
      const sendSpy = spyOnStoreArguments(communicationService, 'send', communicationServiceRetrievedSendArgument);

      // apply changes
      const buttons = fixture.debugElement.queryAll(By.css('lib-button'));
      const applyButton = buttons.filter(e => e.nativeElement.innerText === 'Apply')[0].nativeElement.querySelector('button');
      applyButton.click();
      fixture.detectChanges();

      // check that the send function has been called
      expect(sendSpy).toHaveBeenCalled();

      // check the data that would be send to the server
      expect(communicationServiceRetrievedSendArgument[0].command).toEqual('usersettings');
      expect(communicationServiceRetrievedSendArgument[0].payload.length).toEqual(Object.keys(TestOptionType).length);
      expect(communicationServiceRetrievedSendArgument[0].payload.some(e => e.name === TestOptionType.stopOnFail)).toBeTrue();
      expect(communicationServiceRetrievedSendArgument[0]
        .payload.filter(
          e => e.name === TestOptionType.stopOnFail)[0].active).toBeTrue();
    });
  });
});
