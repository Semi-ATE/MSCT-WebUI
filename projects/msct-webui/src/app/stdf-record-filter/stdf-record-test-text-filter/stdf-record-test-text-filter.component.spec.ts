/* eslint-disable @typescript-eslint/no-explicit-any */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StdfRecordTestTextFilterComponent } from './stdf-record-test-text-filter.component';
import { StorageMap } from '@ngx-pwa/local-storage';
import { DebugElement } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { By } from '@angular/platform-browser';
import { TestTextFilterSetting } from '../../models/storage.model';
import { consoleReducer } from '../../reducers/console.reducer';
import { resultReducer } from '../../reducers/result.reducer';
import { statusReducer } from '../../reducers/status.reducer';
import { userSettingsReducer } from '../../reducers/usersettings.reducer';
import { AppstateService } from '../../services/appstate.service';
import { MockServerService } from '../../services/mockserver.service';
import { StdfRecordFilterService } from '../../services/stdf-record-filter-service/stdf-record-filter.service';
import { StdfRecordType } from '../../stdf/stdf-stuff';
import { CheckboxComponent, InputComponent } from 'shared';
import { expectWaitUntil } from 'shared';

describe('StdfRecordTestTextFilterComponent', () => {
  let component: StdfRecordTestTextFilterComponent;
  let fixture: ComponentFixture<StdfRecordTestTextFilterComponent>;
  let storage: StorageMap;
  let mockServerService: MockServerService;
  let appStateService: AppstateService;
  let filterService: StdfRecordFilterService;
  let debugElement: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        StdfRecordTestTextFilterComponent,
        CheckboxComponent,
        InputComponent,
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
    fixture = TestBed.createComponent(StdfRecordTestTextFilterComponent);
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
    const expectedLabelText = 'Value contained in TEST_TXT';
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
    expect(component.testTextCheckboxConfig.checked).toBeFalse();
  });

  it('should filter tests by provided text', async () => {
    const filterSetting = 'contained_string';

    const matchingRecords = [[
      {type: StdfRecordType.Ptr, values: [{key: 'TEST_TXT', value: 'Pref' + filterSetting + 'Suf'}]},
      {type: StdfRecordType.Ptr, values: [{key: 'TEST_TXT', value: filterSetting + 'Suf'}]},
      {type: StdfRecordType.Ptr, values: [{key: 'TEST_TXT', value: 'Pref'+ filterSetting }]},
      {type: StdfRecordType.Ptr, values: [{key: 'TEST_TXT', value: filterSetting}]},
    ]];

    const notMatchinrecords = [[
      {type: StdfRecordType.Ptr, values: [{key: 'TEST_TXT', value: 'contained_str'}]},
      {type: StdfRecordType.Ptr, values: [{key: 'TEST_TXT', value: 'hello'}]},
      {type: StdfRecordType.Ptr, values: [{key: 'TEST_TXT', value: ''}]},
      {type: StdfRecordType.Ptr, values: [{key: 'TEST_TXT', value: 'contained-string'}]},
    ]];

    const records = matchingRecords.concat(notMatchinrecords);

    // get records into our component
    appStateService.stdfRecords = records;
    filterService.filteredRecords = records;

    await waitProperInitialization();

    // activate filter
    debugElement.query(By.css('lib-checkbox .toggle')).nativeElement.click();

    await expectWaitUntil(
      () => fixture.detectChanges(),
      () => filterService.filteredRecords.length === records.length,
      'Filtered records should match all record in the beginning'
    );

    await expectWaitUntil(
      () => fixture.detectChanges(),
      () => !debugElement.query(By.css('lib-input input')).nativeElement.hasAttribute('disabled'),
      'Disabled attribute is supposed to disapear when filter has been activated'
    );

    component.testTextInputConfig.value = filterSetting;
    component.filterChanged();

    await expectWaitUntil(
      () => fixture.detectChanges(),
      () => filterService.filteredRecords.length === matchingRecords.length,
      'Filtered records should be equal to: ' + JSON.stringify(matchingRecords)
    );
  });

  describe('restoreSettings', () => {
    it('should deactivate test number filter', async (done) => {
      await waitProperInitialization();

      component.testTextCheckboxConfig.checked = true;
      (component as any).restoreSettings();

      await expectWaitUntil(
        () => fixture.detectChanges(),
        () => !component.testTextCheckboxConfig.checked,
        'Restore settings did not deactivate site filter' );
        done();
    });

    it('should apply settings from storage', async (done) => {
      await waitProperInitialization();

      const setting: TestTextFilterSetting = {
        enabled: true,
        containedTestText: 'contained'
      };

      storage.set((component as any).getStorageKey(), setting).subscribe( async () => {
        // test
        (component as any).restoreSettings();
        await expectWaitUntil(
          () => fixture.detectChanges(),
          () => component.testTextCheckboxConfig.checked === setting.enabled &&
            component.testTextInputConfig.value === setting.containedTestText,
          'Restore settings did not apply settings from storage' );
        done();
      });
    });
  });
});
