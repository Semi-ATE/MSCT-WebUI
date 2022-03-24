/* eslint-disable @typescript-eslint/no-explicit-any */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LotHandlingComponent } from './lot-handling.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { SystemState } from '../../models/status.model';
import { consoleReducer } from '../../reducers/console.reducer';
import { resultReducer } from '../../reducers/result.reducer';
import { statusReducer } from '../../reducers/status.reducer';
import { userSettingsReducer } from '../../reducers/usersettings.reducer';
import { CommunicationService } from '../../services/communication.service';
import { MockServerService } from '../../services/mockserver.service';
import { ButtonComponent, InputComponent } from 'shared';
import { CardComponent } from 'shared';
import { spyOnStoreArguments } from 'shared';

describe('LotHandlingComponent', () => {
  let component: LotHandlingComponent;
  let fixture: ComponentFixture<LotHandlingComponent>;
  let debugElement: DebugElement;
  let communicationService: CommunicationService;
  let mockServerService: MockServerService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LotHandlingComponent, ButtonComponent, InputComponent, CardComponent],
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
    communicationService = TestBed.inject(CommunicationService);
    fixture = TestBed.createComponent(LotHandlingComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  afterEach( () => {
    mockServerService.ngOnDestroy();
  });

  it('should create lot-handling component', () => {
    expect(component).toBeTruthy();
  });

  it('should have header text for card element', () => {
    const headerText = debugElement.query(By.css('lib-card h2'))?.nativeElement.innerText;
    expect(headerText).toBe('Lot Handling');
  });

  it('should show an unload lot button', () => {
    const unLoadButton = debugElement.query(By.css('.unloadLotBtn lib-button'));
    expect(unLoadButton.nativeElement.innerText).toBe('Unload Lot');
  });

  it('should show input field for lot number', () => {
    const input = debugElement.query(By.css('.lotInput lib-input'));
    expect(input.nativeElement).toBeDefined();
  });

  it('should display error message', () => {
    const inputElement = debugElement.nativeElement.querySelector('.lotInput lib-input');
    component.lotNumberInputConfig.value = '1234';
    component.loadLot();
    fixture.detectChanges();
    expect(inputElement.textContent).toBe('A lot number should be in 6.3 format like \"123456.123\"');
  });

  it('should send lot number to the server', () => {
    // we need a valid lot number, i.e. 6-point-3-format
    const lotNumber = '123456.123';
    component.lotNumberInputConfig.value = lotNumber;
    fixture.detectChanges();

    const communicationServiceRetrievedSendArgument = [];
    const sendSpy = spyOnStoreArguments(communicationService, 'send', communicationServiceRetrievedSendArgument);

    component.loadLot();
    fixture.detectChanges();
    expect(sendSpy).toHaveBeenCalled();
    expect(communicationServiceRetrievedSendArgument[0].lot_number).toEqual(lotNumber);
  });

  it('input field should be disabled in states connecting, testing, ready and unloading but enabled in state initialized', () => {
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

    let input = fixture.debugElement.query(By.css('lib-input')).nativeElement.querySelector('input');
    expect(input.hasAttribute('disabled')).toBeTruthy();
    // testing
    (component as any).updateStatus({
      deviceId: 'MiniSCT',
      env: 'Environment',
      handler: 'Handler',
      time: '1st July 2020, 19:45:03',
      sites: ['A'],
      program: '',
      log: '',
      state: SystemState.testing,
      reason: '',
    });

    fixture.detectChanges();
    input = fixture.debugElement.query(By.css('lib-input')).nativeElement.querySelector('input');
    expect(input.hasAttribute('disabled')).toBeTruthy();

    // unloading
    (component as any).updateStatus({
      deviceId: 'MiniSCT',
      env: 'Environment',
      handler: 'Handler',
      time: '1st July 2020, 19:45:03',
      sites: ['A'],
      program: '',
      log: '',
      state: SystemState.unloading,
      reason: '',
    });

    fixture.detectChanges();
    input = fixture.debugElement.query(By.css('lib-input')).nativeElement.querySelector('input');
    expect(input.hasAttribute('disabled')).toBeTruthy();

    // ready
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

    input = fixture.debugElement.query(By.css('lib-input')).nativeElement.querySelector('input');
    expect(input.hasAttribute('disabled')).toBeTruthy();

    // initialized
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

    input = fixture.debugElement.query(By.css('lib-input')).nativeElement.querySelector('input');
    expect(input.hasAttribute('disabled')).toBeFalsy();
  });

  it('should call method loadLot when the enter key is pressed',() => {
    const spy = spyOn(component, 'loadLot');

    const input = fixture.debugElement.query(By.css('lib-input')).nativeElement.querySelector('input');
    input.dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter'}));

    expect(spy).toHaveBeenCalled();
  });

  describe('When system state is "ready"', () => {
    it('unload lot button should be active', () => {
      // ready
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
      const buttons = fixture.debugElement.queryAll(By.css('lib-button'));
      const unloadLotButton = buttons.filter(e => e.nativeElement.innerText === 'Unload Lot')[0].nativeElement.querySelector('button');
      expect(unloadLotButton.hasAttribute('disabled')).toBeFalsy('unload lot button is expected to be active');
    });

    it('should call method unloadLot when button clicked',() => {

      // ready
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
      const spy = spyOn(component, 'unloadLot');
      const buttons = fixture.debugElement.queryAll(By.css('lib-button'));
      const unloadLotButton = buttons.filter(e => e.nativeElement.innerText === 'Unload Lot')[0].nativeElement.querySelector('button');
      unloadLotButton.click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });
  });
});
