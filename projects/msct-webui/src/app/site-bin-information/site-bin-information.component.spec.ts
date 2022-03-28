/* eslint-disable @typescript-eslint/no-explicit-any */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SiteBinInformationComponent } from './site-bin-information.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MockServerService } from '../services/mockserver.service';
import * as constants from './../services/mockserver-constants';
import { StoreModule } from '@ngrx/store';
import { statusReducer } from '../reducers/status.reducer';
import { resultReducer } from '../reducers/result.reducer';
import { consoleReducer } from '../reducers/console.reducer';
import { AppstateService } from '../services/appstate.service';
import { SystemBinStatusComponent } from '../system-bin-status/system-bin-status.component';
import { userSettingsReducer } from './../reducers/usersettings.reducer';
import { yieldReducer } from '../reducers/yield.reducer';
import { expectWaitUntil, expectWhile } from 'shared';

describe('SiteBinInformationComponent', () => {
  let component: SiteBinInformationComponent;
  let fixture: ComponentFixture<SiteBinInformationComponent>;
  let debugElement: DebugElement;
  let mockServerService: MockServerService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiteBinInformationComponent, SystemBinStatusComponent],
      providers: [ ],
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
    mockServerService = TestBed.inject(MockServerService);
    TestBed.inject(AppstateService);

    fixture = TestBed.createComponent(SiteBinInformationComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  afterEach( () => {
    mockServerService.ngOnDestroy();
  });

  it('should create site-bin-information component', () => {
    expect(component).toBeTruthy();
  });

  it('should contain an element having class value "defaultStyle" after initialization', () => {
    expect(debugElement.query(By.css('.defaultStyle'))).toBeTruthy();
  });

  it('should contain an element having class value "passStyle" if member variable passStatus is true', () => {
    component.passStatus = true;
    fixture.detectChanges();
    expect(debugElement.query(By.css('.passStyle'))).toBeTruthy();
    expect(debugElement.query(By.css('.defaultStyle, .failStyle'))).toBeFalsy();
  });

  it('should contain an element having class value "failStyle" if member variable passStatus is false', () => {
    component.passStatus = false;
    fixture.detectChanges();
    expect(debugElement.query(By.css('.failStyle'))).toBeTruthy();
    expect(debugElement.query(By.css('.defaultStyle, .passStyle'))).toBeFalsy();
  });

  const expectedContainedLabels = ['Part ID', 'Test Head', 'Site', 'SBIN', 'HBIN'];
  it('should show expected values for the expected label texts: ' + expectedContainedLabels, () => {
    const mockValues = {
      partId : '121345',
      siteNum : 346,
      headNum : 17,
      siteName: 'MiniSCT A',
      sBin: 23,
      hBin: 103
    };

    component.partId = mockValues.partId;
    (component as any).siteNumber = mockValues.siteNum;
    (component as any).headNumber = mockValues.headNum;
    (component as any).siteName = mockValues.siteName;
    component.passStatus = true;
    component.softBin = mockValues.sBin;
    component.hardBin = mockValues.hBin;
    fixture.detectChanges();

    const labelAndValueTexts = debugElement.queryAll(By.css('p')).map(e => e.nativeElement.innerText);

    expectedContainedLabels.forEach( e => {
      expect(labelAndValueTexts.filter(h => h.includes(e)).length).toBeGreaterThan(0);
    });

    const expectedContainedValues = Object.entries(mockValues).map(([_k,v]) => v);

    expectedContainedValues.forEach( e => {
      expect(labelAndValueTexts.filter(h => h.includes(e)).length).toBeGreaterThan(0);
    });
  });

  it('should indicate a failed part in case that the server sends information that the part has failed the test program ', async () => {
    // component should show bin information from site 0 and head 0
    (component as any).siteNumber = 0;
    (component as any).headNumber = 0;
    (component as any).siteName = 'A';
    fixture.detectChanges();

    // mock server message by using the mock server service
    mockServerService.setMessages([
      constants.TEST_RESULT_SITE_0_TEST_FAILED
    ]);

    // wait until server message has been processed by this component
    const waitUntilCondition = (): boolean => debugElement.query(By.css('.failStyle')) !== null;
    const iterativelyCalledFunction = (): void => {
      fixture.detectChanges();
    };

    await expectWaitUntil(
      iterativelyCalledFunction,
      waitUntilCondition,
      'Failed test result received from server did not lead to the expected failed part indication');
  });

  it('should not change if server sends result information for other site', async () => {
    // component should show bin information from site 0 and head 0
    (component as any).siteNumber = 1;
    (component as any).headNumber = 0;
    (component as any).siteName = 'A';
    fixture.detectChanges();

    const resultMessageForDifferentSite = constants.TEST_RESULT_SITE_2_TEST_FAILED;
    expect(resultMessageForDifferentSite
      .payload.filter(r => r.type === 'PRR')[0].SITE_NUM)
      .not.toEqual((component as any).siteNumber, 'Server message should address a different site, i.e. site number of PRR-record must be different');

    // mock server message by using the mock server service
    mockServerService.setMessages([
      resultMessageForDifferentSite
    ]);

    const waitWhileCondition = (): boolean => debugElement.query(By.css('.defaultStyle')) !== null;
    const updateFixture = (): void => {
      fixture.detectChanges();
    };

    await expectWhile(
      updateFixture,
      waitWhileCondition,
      'Component should not change in case a result message is send by the server with different site number',
    );
  });
});
