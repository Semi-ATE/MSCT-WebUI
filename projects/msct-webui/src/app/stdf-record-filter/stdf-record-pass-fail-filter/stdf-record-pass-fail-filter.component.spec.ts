/* eslint-disable @typescript-eslint/no-explicit-any */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StdfRecordPassFailFilterComponent } from './stdf-record-pass-fail-filter.component';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { PassFailFilterSetting } from '../../models/storage.model';
import { consoleReducer } from '../../reducers/console.reducer';
import { resultReducer } from '../../reducers/result.reducer';
import { statusReducer } from '../../reducers/status.reducer';
import { userSettingsReducer } from '../../reducers/usersettings.reducer';
import { AppstateService } from '../../services/appstate.service';
import { MockServerService } from '../../services/mockserver.service';
import { StdfRecordFilterService } from '../../services/stdf-record-filter-service/stdf-record-filter.service';
import { StdfRecordType } from '../../stdf/stdf-stuff';
import { CheckboxComponent } from 'shared';
import { DropdownComponent } from 'shared';
import { expectWaitUntil } from 'shared';

describe('StdfRecordPassFailFilterComponent', () => {
  let component: StdfRecordPassFailFilterComponent;
  let fixture: ComponentFixture<StdfRecordPassFailFilterComponent>;
  let storage: StorageMap;
  let mockServerService: MockServerService;
  let appStateService: AppstateService;
  let filterService: StdfRecordFilterService;
  let debugElement: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        StdfRecordPassFailFilterComponent,
        CheckboxComponent,
        DropdownComponent
      ],
      imports: [
        FormsModule,
        StoreModule.forRoot({
          systemStatus: statusReducer, // key must be equal to the key define in interface AppState, i.e. systemStatus
          results: resultReducer, // key must be equal to the key define in interface AppState, i.e. results
          consoleEntries: consoleReducer, // key must be equal to the key define in interface AppState, i.e. consoleEntries
          userSettings: userSettingsReducer, // key must be equal to the key define in interface AppState, i.e. userSettings
        }),
      ],
    })
    .compileComponents();
  }));

  beforeEach( async () => {
    storage = TestBed.inject(StorageMap);
    await storage.clear().toPromise();
    mockServerService = TestBed.inject(MockServerService);
    appStateService = TestBed.inject(AppstateService);
    filterService = TestBed.inject(StdfRecordFilterService);
    fixture = TestBed.createComponent(StdfRecordPassFailFilterComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  afterEach( () => {
    mockServerService.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  async function waitProperInitialization(): Promise<void> {
    const expectedLabelText = 'Pass/Fail Information';
    await expectWaitUntil(
      () => fixture.detectChanges(),
      () => debugElement.queryAll(By.css('label')).some(e => e.nativeElement.innerText === expectedLabelText),
      'Expected label text ' + expectedLabelText + ' was not found.'
    );
  }

  it('should show Pass/Fail Information initially', async () => {
    await waitProperInitialization();
  });

  it('should be deactivated in the very beginning', async () => {
    expect(component.passFailCheckboxConfig.checked).toBeFalse();
  });

  it('should only show pass tests if activated and configured for tests that pass', async () => {
    // we need some records with different site numbers
    const passRecords = [[
      {type: StdfRecordType.Ptr, values: [{key: 'TEST_FLG', value: 0}]},
      {type: StdfRecordType.Ptr, values: [{key: 'TEST_FLG', value: 0}]},
    ]];

    const failedRecords = [[
      {type: StdfRecordType.Ptr, values: [{key: 'TEST_FLG', value: 1}]},
      {type: StdfRecordType.Ptr, values: [{key: 'TEST_FLG', value: 2}]},
      {type: StdfRecordType.Ptr, values: [{key: 'TEST_FLG', value: 11}]},
      {type: StdfRecordType.Ptr, values: [{key: 'TEST_FLG', value: 10}]},
      {type: StdfRecordType.Ptr, values: [{key: 'TEST_FLG', value: 8}]},
    ]];

    const records = passRecords.concat(failedRecords);

    // get records into our component
    appStateService.stdfRecords = records;
    filterService.filteredRecords = records;

    await waitProperInitialization();

    // activate filter
    debugElement.query(By.css('lib-checkbox .toggle')).nativeElement.click();

    await expectWaitUntil(
      () => fixture.detectChanges(),
      () => filterService.filteredRecords.length === failedRecords.length,
      'Filtered records should match the failed records'
    );

    await expectWaitUntil(
      () => fixture.detectChanges(),
      () => !debugElement.query(By.css('lib-dropdown.dropdox.disabled')),
      'Filtered records should match the failed records'
    );

    component.dropdownConfig.selectedIndex = 1;
    component.dropdownConfig.value = component.dropdownConfig.items[1].value;
    component.filterChanged();

    await expectWaitUntil(
      () => fixture.detectChanges(),
      () => filterService.filteredRecords.length === passRecords.length,
      'Filtered records should match the passed records'
    );
  });

  describe('restoreSettings', () => {
    it('should deactivate site number filter', async (done) => {
      await waitProperInitialization();

      component.passFailCheckboxConfig.checked = true;
      (component as any).restoreSettings();

      await expectWaitUntil(
        () => fixture.detectChanges(),
        () => !component.passFailCheckboxConfig.checked,
        'Restore settings did not deactivate site filter' );
        done();
      });
    });

    it('should apply settings from storage', async (done) => {
      await waitProperInitialization();

      const setting: PassFailFilterSetting = {
        enabled: true,
        selectedIndex: 1
      };

      storage.set((component as any).getStorageKey(), setting).subscribe( async () => {
        // test
        (component as any).restoreSettings();
        await expectWaitUntil(
          () => fixture.detectChanges(),
          () => component.passFailCheckboxConfig.checked === setting.enabled &&
            component.dropdownConfig.selectedIndex === setting.selectedIndex,
          'Restore settings did not apply settings from storage' );
        done();
      });
    });

});
