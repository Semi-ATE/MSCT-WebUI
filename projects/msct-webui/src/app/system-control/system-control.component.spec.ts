import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { SystemControlComponent } from './system-control.component';
import { TestExecutionComponent } from './test-execution/test-execution.component';
import { TestOptionComponent } from './test-option/test-option.component';
import { LotHandlingComponent } from './lot-handling/lot-handling.component';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { statusReducer } from '../reducers/status.reducer';
import { resultReducer } from '../reducers/result.reducer';
import { consoleReducer } from '../reducers/console.reducer';
import { userSettingsReducer } from './../reducers/usersettings.reducer';
import { SystemHandlingComponent } from './system-handling/system-handling/system-handling.component';
import { MockServerService } from '../services/mockserver.service';
import { StorageMap } from '@ngx-pwa/local-storage';
import { AppstateService } from '../services/appstate.service';
import { ButtonComponent, InputComponent } from 'shared';
import { CardComponent } from 'shared';
import { CheckboxComponent } from 'shared';
import { DropdownComponent } from 'shared';
import { MultichoiceComponent } from 'shared';

describe('SystemControlComponent', () => {
  let component: SystemControlComponent;
  let fixture: ComponentFixture<SystemControlComponent>;
  let debugElement: DebugElement;
  let mockServerService: MockServerService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        SystemControlComponent,
        TestExecutionComponent,
        TestOptionComponent,
        LotHandlingComponent,
        SystemHandlingComponent,
        CardComponent,
        InputComponent,
        ButtonComponent,
        CheckboxComponent,
        DropdownComponent,
        MultichoiceComponent
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
    TestBed.inject(StorageMap);
    mockServerService = TestBed.inject(MockServerService);
    TestBed.inject(AppstateService);
    fixture = TestBed.createComponent(SystemControlComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockServerService.ngOnDestroy();
  });

  it('should create system control component', () => {
    expect(component).toBeDefined();
  });

  it('should support labelText', () => {

    // check lib-card header text
    const expectedHeaderText = 'Control';
    const appCardHeader = debugElement.nativeElement.querySelector('lib-card .header');
    expect(expectedHeaderText).toEqual(component.systemControlCardConfiguration.labelText);
    expect(appCardHeader.textContent).toContain(expectedHeaderText);

    // check option label text
    const optionDebugElement = debugElement.query(By.directive(TestOptionComponent));
    const expectedOptionsLabelText = 'Options';
    const optionsAppCardHeader = debugElement.nativeElement.querySelector('#option lib-card .header');
    expect(expectedOptionsLabelText).toEqual(optionDebugElement.context.testOptionCardConfiguration.labelText);
    expect(optionsAppCardHeader.textContent).toContain(expectedOptionsLabelText);
  });

  describe('Tags of the other component type', () => {
    it('should contain an lib-card tag', () => {
      const componentElement = debugElement.nativeElement.querySelector('lib-card');
      expect(componentElement).not.toEqual(null);
    });

    it('should contain an app-lot-handling tag', () => {
      const componentElement = debugElement.nativeElement.querySelector('app-lot-handling');
      expect(componentElement).not.toEqual(null);
    });

    it('should not contain an app-test-execution tag', () => {
      const componentElement = debugElement.nativeElement.querySelector('app-test-execution');
      expect(componentElement).toEqual(null);
    });

    it('should contain an app-test-option tag', () => {
      const componentElement = debugElement.nativeElement.querySelector('app-test-option');
      expect(componentElement).not.toEqual(null);
    });
  });

  describe('System Message', () => {
    it('should show a multichoice field', () => {
      const multichoice = debugElement.queryAll(By.css('lib-multichoice'));
      expect(multichoice.length).toBe(1, 'There should be an unique multichoice filed');
    });

    it('should show label text', () => {
      expect(component.systemMessageCardConfiguration.labelText).toEqual('System Message', 'Expected label text should be "System Message"');
    });

    it('should show expected multichoice items', () => {
      const expectedMultichoiceItems = ['Debug', 'Info', 'Warning', 'Error'];
      expect(component.modalDialogFilterConfig.items.map(e => e.label)).toEqual(expectedMultichoiceItems, `Multichoice items should be ${expectedMultichoiceItems}`);
    });
  });
});
