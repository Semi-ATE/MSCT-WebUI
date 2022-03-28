/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TccLotHandlingComponent } from './tcc-lot-handling.component';
import { ButtonComponent, CardComponent, InputComponent, spyOnStoreArguments } from 'shared';
import { FormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { WebsocketService } from '../../services/websocket/websocket.service';
import { Status } from '../../models/element-status.models';
import { TccMockServerService } from '../../services/tcc-mock-server/tcc-mock-server.service';
import { StoreModule } from '@ngrx/store';
import { tccComponentsReducer } from '../../store/reducers/components.reducers';

describe('TccLotHandlingComponent', () => {
  let component: TccLotHandlingComponent;
  let fixture: ComponentFixture<TccLotHandlingComponent>;
  let debugElement: DebugElement;
  let websocketService: WebsocketService;
  let mockServer: TccMockServerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TccLotHandlingComponent,
        CardComponent,
        InputComponent,
        ButtonComponent
      ],
      imports: [
        FormsModule,
        StoreModule.forRoot({
          components: tccComponentsReducer
        })
      ],
      providers: [WebsocketService]
    })
    .compileComponents();
  });

  beforeEach(() => {
    mockServer = TestBed.inject(TccMockServerService);
    websocketService = TestBed.inject(WebsocketService);
    fixture = TestBed.createComponent(TccLotHandlingComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockServer.ngOnDestroy();
  });

  it('should create tcc-lot-handling component', () => {
    expect(component).toBeTruthy();
  });

  it('should have header text for card element', () => {
    expect(component.lotCardConfiguration.labelText).toBe('Lot Handling');
  });

  it('should show input field for lot number', () => {
    const input = debugElement.query(By.css('lib-input'));
    expect(input.nativeElement).toBeDefined();
  });

  it('should send lot number to the server', () => {
    const lotNumber = '123456.123';
    component.lotNumberInputConfiguration.value = lotNumber;
    fixture.detectChanges();

    const websocketServiceRetrievedSendArgument = [];
    const sendSpy = spyOnStoreArguments(websocketService, 'send', websocketServiceRetrievedSendArgument);

    component.loadLot();
    fixture.detectChanges();

    expect(sendSpy).toHaveBeenCalled();
    expect(websocketServiceRetrievedSendArgument[0].payload.payload.job_name).toEqual(lotNumber);
  });

  describe('Input field', () => {
    it('should display error message', () => {
      const inputElement = debugElement.nativeElement.querySelector('lib-input');

      component.lotNumberInputConfiguration.value = '123456';
      component.loadLot();
      fixture.detectChanges();

      expect(inputElement.textContent).toBe('A lot number should be in 6.3 format like \"123456.123\"');
    });

    it(`should not be 'disabled' when Status is "${Status.ready}"`, () => {
      (component as any).updateState(Status.ready);

      expect(component.lotNumberInputConfiguration.disabled).toEqual(false);
    });
  });

  it('should call method loadLot when the enter key is pressed', () => {
    const spy = spyOn(component, 'loadLot');

    const input = debugElement.query(By.css('lib-input')).nativeElement.querySelector('input');
    input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));

    expect(spy).toHaveBeenCalled();
  });

  describe('updateState', () => {
    it(`should call deactivateUserControls when the state is not "${Status.ready}"`, () => {
      const spy = spyOn<any>(component, 'deactivateUserControls');

      (component as any).updateState(!Status.ready);

      expect(spy).toHaveBeenCalled();
    });


    it(`should be called with expected state ['${Status.busy}'] when the correct component name is found`, () => {
      const expectedState = Status.busy;
      const message = {
        topic: 'ws/testcellcomponents',
        payload: {
          components: [
            {
              component: 'Supervisor',
              state: expectedState
            }
          ]
        }
      };

      const spy = spyOn<any>(component, 'updateState');
      (component as any).updateSupervisorState(message.payload.components);

      expect(spy).toHaveBeenCalledWith(expectedState);
    });

    it('should be called with "[]" when components of serverMessage is empty', () => {
      const serverMessage = {
        topic: 'ws/testcellcomponents',
        payload: {
          components: []
        }
      };

      const spy = spyOn<any>(component, 'updateState');
      (component as any).updateSupervisorState(serverMessage.payload.components);

      expect(spy).not.toHaveBeenCalledWith([]);
    });
  });

  describe('Unload Lot Button', () => {
    it('should show an "Unload Lot" button', () => {
      const buttons = debugElement.queryAll(By.css('lib-button'));
      const unloadButtons = buttons.filter(e => e.nativeElement.innerText.includes('Unload Lot'));

      expect(unloadButtons.length).toEqual(1, 'There should be an unique button with label text "Ueload Lot"');
    });

    it(`should be 'disabled' when state is "${Status.ready}"`, () => {
      expect(component.unloadLotButtonConfiguration.disabled).toEqual(false);

      (component as any).updateState(Status.ready);

      expect(component.unloadLotButtonConfiguration.disabled).toEqual(true);
    });
  });

  describe(`When system state is ${Status.busy}`, () => {
    it('unload lot button should be active', () => {
      (component as any).updateState(Status.busy);

      const buttons = debugElement.queryAll(By.css('lib-button'));
      const unloadLotButton = buttons.filter(e => e.nativeElement.innerText === 'Unload Lot')[0].nativeElement.querySelector('button');

      expect(unloadLotButton.hasAttribute('disabled')).toBeFalsy('unload lot button is expected to be active');
    });

    it('should call method unloadLot when button clicked', () => {
      (component as any).updateState(Status.busy);

      const spy = spyOn(component, 'unloadLot');
      const buttons = debugElement.queryAll(By.css('lib-button'));
      const unloadLotButton = buttons.filter(e => e.nativeElement.innerText === 'Unload Lot')[0].nativeElement.querySelector('button');

      unloadLotButton.click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });

    it('should send "UnloadJob" command to the server', () => {
      const sendSpy = spyOn(websocketService, 'send');

      component.unloadLot();

      expect(sendSpy).toHaveBeenCalledWith({
        topic: 'TCC/tcc01/Supervisor/command',
        payload: {
          command: 'UnloadJob',
          payload: {}
        }
      });
    });

    it('should call method "reloadLot" when button clicked', () => {
      (component as any).receivedElementState = {
        state: Status.busy
      };
      fixture.detectChanges();

      const spy = spyOn(component, 'reloadLot');
      const buttons = debugElement.queryAll(By.css('lib-button'));
      const reloadLotButton = buttons.find(e => e.nativeElement.innerText === 'Reload Lot').nativeElement.querySelector('button');

      reloadLotButton.click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });

    it('should send "ReloadJob" command to the server', () => {
      const sendSpy = spyOn(websocketService, 'send');

      component.reloadLot();

      expect(sendSpy).toHaveBeenCalledWith({
        topic: 'TCC/tcc01/Supervisor/command',
        payload: {
          command: 'ReloadJob',
          payload: {}
        }
      });
    });
  });

  describe('Reload Lot Button', () => {
    it('should show an "Reload Lot" button', () => {
      const buttons = debugElement.queryAll(By.css('lib-button'));
      const reloadLotButtons = buttons.filter(e => e.nativeElement.innerText.includes('Reload Lot'));

      expect(reloadLotButtons.length).toEqual(1, 'There should be an unique button with label text "Reload Lot"');
    });

    it(`should not be "disabled" when state is "${Status.busy}", otherwise e.g. "${Status.starting}" it is "disabled"`, () => {
      (component as any).updateState(Status.busy);
      expect(component.unloadLotButtonConfiguration.disabled).toEqual(false);

      (component as any).updateState(Status.starting);
      expect(component.unloadLotButtonConfiguration.disabled).toEqual(true);
    });
  });
});
