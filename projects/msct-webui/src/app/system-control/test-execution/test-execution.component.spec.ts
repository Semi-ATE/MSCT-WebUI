/* eslint-disable @typescript-eslint/no-explicit-any */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TestExecutionComponent } from './test-execution.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { SystemState } from '../../models/status.model';
import { consoleReducer } from '../../reducers/console.reducer';
import { resultReducer } from '../../reducers/result.reducer';
import { statusReducer } from '../../reducers/status.reducer';
import { userSettingsReducer } from '../../reducers/usersettings.reducer';
import { yieldReducer } from '../../reducers/yield.reducer';
import { ButtonComponent } from 'shared';
import { CardComponent } from 'shared';

describe('TestExecutionComponent', () => {
  let component: TestExecutionComponent;
  let fixture: ComponentFixture<TestExecutionComponent>;
  let debugElement: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestExecutionComponent, ButtonComponent, CardComponent],
      schemas: [],
      imports: [
        StoreModule.forRoot({
          systemStatus: statusReducer, // key must be equal to the key define in interface AppState, i.e. systemStatus
          results: resultReducer, // key must be equal to the key define in interface AppState, i.e. results
          consoleEntries: consoleReducer, // key must be equal to the key define in interface AppState, i.e. consoleEntries
          userSettings: userSettingsReducer, // key must be equal to the key define in interface AppState, i.e. userSettings
          yield: yieldReducer
        })
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestExecutionComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create test-execution component', () => {
    expect(component).toBeTruthy();
  });

  it('should support label text "Test Execution"', () => {
    const cardLabelText = 'Test Execution';

    expect(component.testExecutionControlCardConfiguration.labelText).toBe(cardLabelText, 'Should be "Test Execution"');
  });

  it('should show a start Dut-Test button', () => {
    const buttonText = 'Start DUT-Test';

    expect(component.startDutTestButtonConfig.labelText).toBe(buttonText, 'Should be "Start DUT-Test"');
  });

  describe('When system state is "connecting"', () => {
    it('should have a disabled start-dut-test-button', () => {

      // connecting
      (component as any).updateStatus({
        deviceId: 'MiniSCT',
        env: 'Environment',
        handler: 'Handler',
        time: '1st July 2020, 19:45:03',
        sites: ['A'],
        program: '',
        log: '',
        state: SystemState.connecting,
        reason: '',
      });
      fixture.detectChanges();

      const startDutTestButton = debugElement.queryAll(By.css('lib-button'))
        .filter(b => b.nativeElement.innerText === 'Start DUT-Test')[0]
        .nativeElement.querySelector('button');

      expect(startDutTestButton.hasAttribute('disabled'))
        .toBeTruthy('start DUT-Test button is expected to be inactive');
    });
  });

  describe('When system state is "ready"', () => {
    it('start-dut-test-button should be active', () => {

      // ready state
      (component as any).updateStatus({
        deviceId: 'MiniSCT',
        env: 'Environment',
        handler: 'Handler',
        time: '1st July 2020, 19:45:03',
        sites: ['A'],
        program: 'Test Program Name',
        log: '',
        state: SystemState.ready,
        reason: '',
      });
      fixture.detectChanges();

      const startDutTestButton = debugElement.queryAll(By.css('lib-button'))
        .filter(b => b.nativeElement.innerText === 'Start DUT-Test')[0]
        .nativeElement.querySelector('button');

      expect(startDutTestButton.hasAttribute('disabled'))
        .toBeFalsy('start DUT-Test button is expected to be active');
    });

    it('should call method startDutTestButtonClicked when button clicked', () => {

      // ready state
      (component as any).updateStatus({
        deviceId: 'MiniSCT',
        env: 'Environment',
        handler: 'Handler',
        time: '1st July 2020, 19:45:03',
        sites: ['A'],
        program: 'Test Program Name',
        log: '',
        state: SystemState.ready,
        reason: '',
      });
      fixture.detectChanges();

      const spy = spyOn(component, 'startDutTest').and.callThrough();
      expect(spy).toHaveBeenCalledTimes(0);

      const startDutTestButton = debugElement.queryAll(By.css('lib-button'))
        .filter(b => b.nativeElement.innerText === 'Start DUT-Test')[0]
        .nativeElement.querySelector('button');

      startDutTestButton.click();
      fixture.detectChanges();
      expect(spy).toHaveBeenCalled();
    });
  });
});
