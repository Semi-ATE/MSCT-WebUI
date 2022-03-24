/* eslint-disable @typescript-eslint/no-explicit-any */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { statusReducer } from '../reducers/status.reducer';
import { lotdataReducer } from '../reducers/lotdata.reducer';
import { LotDataComponent } from './lot-data.component';
import { DebugElement } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { MockServerService } from '../services/mockserver.service';
import { AppstateService } from '../services/appstate.service';
import { By } from '@angular/platform-browser';
import { SystemState } from '../models/status.model';
import * as constants from '../services/mockserver-constants';
import { LotDataSetting } from '../models/storage.model';
import { CardComponent } from 'shared';
import { TableComponent } from 'shared';
import { TabComponent } from 'shared';
import { expectWaitUntil } from 'shared';

describe('LotDataComponent', () => {
  let component: LotDataComponent;
  let fixture: ComponentFixture<LotDataComponent>;
  let debugElement: DebugElement;
  let mockServerService: MockServerService;
  let storage: StorageMap;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LotDataComponent, TabComponent, TableComponent, CardComponent ],
      imports: [
        StoreModule.forRoot({
          systemStatus: statusReducer,
          lotData: lotdataReducer
        })
      ]
    })
    .compileComponents();
  }));

  beforeEach(async () => {
    storage = TestBed.inject(StorageMap);
    await storage.clear().toPromise();
    mockServerService = TestBed.inject(MockServerService);
    TestBed.inject(AppstateService);

    fixture = TestBed.createComponent(LotDataComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockServerService.ngOnDestroy();
  });

  it('should create lot-data component', () => {
    expect(component).toBeTruthy();
  });

  it('should show label text', () => {
    expect(component.lotDataCardConfiguration.labelText).toBe('Lot Data');
  });

  const noLotDataEntryMsg = 'No lot data avaliable';
  it('should show "'+ noLotDataEntryMsg + '", when system state is ' + JSON.stringify(SystemState.connecting), () => {
    expect((component as any).status.state).toBe('connecting');

    const messageElement = debugElement.query(By.css('p'));

    expect(messageElement.nativeElement.innerText).toEqual(noLotDataEntryMsg);
  });

  describe('When system status is ready and lot data is available', () => {
    it('should show expected tabs', async () => {
      mockServerService.setMessages([
        constants.MESSAGE_WHEN_SYSTEM_STATUS_READY,
        constants.LOT_DATA
      ]);

      await expectWaitUntil(
        () => fixture.detectChanges(),
        () => debugElement.queryAll(By.css('li')).length > 0,
        'Can not find elements for lot data');

      const expectedTabLabels = ['Important', 'All'];
      const tabLabels = debugElement.queryAll(By.css('.tabLabel li')).map(e => e.nativeElement.innerText);

      expect(tabLabels).toEqual(expectedTabLabels);
    });

    it('should show expected value of headerRow', () => {
      const expectedTableHeaders = ['Name', 'Wert'];

      component.lotDataTabConfiguration.selectedIndex = 1;
      (component as any).updateTableElement();

      expectedTableHeaders.forEach( e => {
        expect(component.lotDataTableConfiguration.headerRow.filter(h => h.text.includes(e)).length).toBeGreaterThan(0);
      });
    });

    it('should change current lot data automatically in case that a new lot data arrives', async () => {
      expect((component as any).lotData.values.length).toEqual(0);

      mockServerService.setMessages([
        constants.MESSAGE_WHEN_SYSTEM_STATUS_READY
      ]);

      await expectWaitUntil(
        () => fixture.detectChanges(),
        () => debugElement.queryAll(By.css('li')).length > 0,
        'Can not find elements for lot data');

      (component as any).lotData = {
        values: [
          {key: 'Node ID', value: 'SCT50'},
          {key: 'Setup Time', value:'15:49:26-Mar-2020'}
        ]
      };

      const expectedLotDataTableEntries = ['Node ID', 'SCT50', 'Setup Time', '15:49:26-Mar-2020'];

      component.lotDataTabConfiguration.selectedIndex = 1;
      (component as any).updateTableElement();
      fixture.detectChanges();

      const lotDataTableEntries = debugElement.queryAll(By.css('.tableRow li')).map(e => e.nativeElement.innerText);

      expect(lotDataTableEntries).toEqual(expectedLotDataTableEntries);
    });

    it('should update the selected tab', async () => {
      mockServerService.setMessages([
        constants.MESSAGE_WHEN_SYSTEM_STATUS_READY,
        constants.LOT_DATA
      ]);

      await expectWaitUntil(
        () => fixture.detectChanges(),
        () => debugElement.queryAll(By.css('li')).length > 0,
        'Can not find elements for lot data');

      expect(component.lotDataTabConfiguration.selectedIndex).toEqual(0);
      expect(debugElement.query(By.css('.selected')).nativeElement.innerText).toBe('Important');

      component.lotDataTabConfiguration.selectedIndex = 1;
      fixture.detectChanges();

      expect(debugElement.query(By.css('.selected')).nativeElement.innerText).toBe('All');
    });
  });

  async function waitProperInitialization(): Promise<void> {
    mockServerService.setMessages([
      constants.MESSAGE_WHEN_SYSTEM_STATUS_READY,
      constants.LOT_DATA
    ]);

    const expectedTabLabelText = 'Important';

    await expectWaitUntil(
      () => fixture.detectChanges(),
      () => debugElement.queryAll(By.css('.selected')).some(e => e.nativeElement.innerText === expectedTabLabelText),
      'Expected tab label text ' + expectedTabLabelText + ' was not found.'
    );
  }

  describe('restoreSelectedTabIndex', () => {
    it('should restore selected tab index from localStorage', async (done) => {
      await waitProperInitialization();

      component.lotDataTabConfiguration.selectedIndex = 10000;
      (component as any).restoreSelectedTabIndex();

      await expectWaitUntil(
        () => fixture.detectChanges(),
        () => component.lotDataTabConfiguration.selectedIndex === 0,
        'Restore selected tab index from localStorage failed');
      done();
    });

    it('should apply settings from storage', async (done) => {
      await waitProperInitialization();

      const setting: LotDataSetting = {
        selectedTabIndex: 10
      };

      storage.set((component as any).getStorageKey(), setting).subscribe(async () => {
        (component as any).restoreSelectedTabIndex();
        await expectWaitUntil(
          () => fixture.detectChanges(),
          () => component.lotDataTabConfiguration.selectedIndex === 10,
          'Restore settings did not apply settings from storage');
        done();
      });
    });
  });

  describe('updateTableElement', () => {
    it('should call computeImportantMirTable', () => {
      const spyOnUpdateImportantMirTable = spyOn<any>(component, 'computeImportantMirTable');

      (component as any).updateTableElement();

      expect(spyOnUpdateImportantMirTable).toHaveBeenCalled();
    });

    it('should call computeMirTable', () => {
     const spyOnUpdateMirTable = spyOn<any>(component, 'computeMirTable');

     component.lotDataTabConfiguration.selectedIndex = 1;
     (component as any).updateTableElement();

     expect(spyOnUpdateMirTable).toHaveBeenCalled();
    });
  });
});
