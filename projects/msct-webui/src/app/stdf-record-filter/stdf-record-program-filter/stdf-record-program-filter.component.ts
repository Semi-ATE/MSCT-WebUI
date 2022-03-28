import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { CheckboxConfiguration } from 'shared';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppState, selectDeviceId } from './../../app.state';
import { InputConfiguration } from 'shared';
import { SettingType, ProgramFilterSetting } from './../../models/storage.model';
import { SdtfRecordProgramFilter } from './../../services/stdf-record-filter-service/stdf-record-filter';
import { StdfRecordFilterService } from './../../services/stdf-record-filter-service/stdf-record-filter.service';
import { computePassedInformationForTestFlag, StdfRecord, STDF_RECORD_ATTRIBUTES, STDF_RESULT_RECORDS } from './../../stdf/stdf-stuff';

export interface TestResult {
  testNumber: number;
  passed: boolean;
}

export interface ProgramPattern {
  pattern: Array<TestResult>;
}

@Component({
  selector: 'app-stdf-record-program-filter',
  templateUrl: './stdf-record-program-filter.component.html',
  styleUrls: ['./stdf-record-program-filter.component.scss']
})
export class StdfRecordProgramFilterComponent implements OnInit, OnDestroy {
  testProgramCheckboxConfig: CheckboxConfiguration;
  testProgramInputConfig: InputConfiguration;
  private deviceId: string;
  private readonly unsubscribe: Subject<void>;
  private readonly filter$: Subject<SdtfRecordProgramFilter>;
  private readonly filter: SdtfRecordProgramFilter;

  constructor(private readonly store: Store<AppState>, private readonly filterService: StdfRecordFilterService, private readonly storage: StorageMap) {
    this.testProgramCheckboxConfig = new CheckboxConfiguration();
    this.testProgramInputConfig = new InputConfiguration();
    this.deviceId = undefined;
    this.unsubscribe = new Subject<void>();
    this.filter$ = new Subject<SdtfRecordProgramFilter>();
    this.filter = {
      active: false,
      filterFunction: (): boolean => true
    };
  }

  ngOnInit(): void {
    this.filterService.registerProgramFilter(this.filter$);
    this.updateFilterAndPublish();
    this.subscribeDeviceId();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  testProgramFilterChanged(): void {
    this.testProgramInputConfig.disabled = !this.testProgramCheckboxConfig.checked;
    this.updateFilterAndPublish();
    this.saveSettings();
    if (!this.testProgramCheckboxConfig.checked) {
      this.testProgramInputConfig.errorMsg = '';
    }
  }

  private updateFilterAndPublish(): void {
    this.filter.active = this.testProgramCheckboxConfig.checked;
    if (this.testProgramCheckboxConfig.checked) {
      const patterns = this.extractAllPattern(this.testProgramInputConfig.value);
      if (patterns === undefined) {
        this.testProgramInputConfig.errorMsg = 'Input not valid. Valid example: (100,f) && (302,p) || (117,p)';
        return;
      }
      this.testProgramInputConfig.errorMsg = '';
      if (patterns.length === 0) {
        this.filter.filterFunction = (_e: StdfRecord[]): boolean => true;
      } else {
        this.filter.filterFunction =
          (r: StdfRecord[]): boolean => patterns.some(p => p.pattern.every(pr => r.some(t => this.recordMatches(t, pr.testNumber, pr.passed))));
      }
    }
    this.filter$.next(this.filter);
  }

  private recordMatches(s: StdfRecord, testNumber: number, passed: boolean): boolean {
    if (STDF_RESULT_RECORDS.includes(s.type)) {
      return s.values.some(v => v.key === STDF_RECORD_ATTRIBUTES.TEST_NUM && v.value === testNumber) &&
             s.values.some(v => v.key === STDF_RECORD_ATTRIBUTES.TEST_FLG && computePassedInformationForTestFlag(v.value as number) === passed);
    }
    return false;
  }

  private defaultSettings(): void {
    this.testProgramCheckboxConfig.initCheckBox('Program Pattern', false, false);
    this.testProgramInputConfig.initInput('Pattern', true, '', /([0-9]|&|\||\(|\)|,|p|f|P|F|\s)/);
  }

  private restoreSettings(): void {
    this.storage.get(this.getStorageKey())
      .subscribe( e => {
        this.defaultSettings();
        const programFilterSetting = e as ProgramFilterSetting;
        if (programFilterSetting && typeof programFilterSetting.value === 'string' && typeof programFilterSetting.enabled === 'boolean' ) {
          this.testProgramCheckboxConfig.checked = programFilterSetting.enabled;
          this.testProgramInputConfig.disabled = !programFilterSetting.enabled;
          this.testProgramInputConfig.value = programFilterSetting.value;
          this.testProgramFilterChanged();
        }
      });
  }

  private saveSettings(): void {
    const setting: ProgramFilterSetting = {
      enabled: this.testProgramCheckboxConfig.checked,
      value: this.testProgramInputConfig.value
    };
    this.storage.set(this.getStorageKey(), setting).subscribe( () => true);
  }

  private getStorageKey(): string {
    return `${this.deviceId}${SettingType.ProgramFilter}`;
  }

  private extractAllPattern(value: string ): Array<ProgramPattern> {
    if (this.inputValid(value)) {
      const result = [];
      value = this.normalizeInput(value);
      const patterns = value.split('||').filter(e => e !== '');
      for (let idx = 0; idx < patterns.length; ++idx) {
        const extractedPattern = this.extractPattern(patterns[idx]);
        if (extractedPattern === undefined) {
          return undefined;
        }
        if (extractedPattern.pattern.length === 0) {
          continue;
        }
        result.push(extractedPattern);
      }
      return result;
    }
    return undefined;
  }

  private extractPattern(value: string): ProgramPattern {
    let result: ProgramPattern;
    value = this.normalizeInput(value);
    const pattern = /^\([0-9]+,[a-z]+\)(&&\([0-9]+,[a-z]+\))*$/;
    if (pattern.test(value)) {
      const testResults = value.split('&&').filter(e => e !== '');
      const programPattern = new Array<TestResult>();
      for (let idx = 0; idx < testResults.length; ++idx) {
        const testResult = this.extractTestResult(testResults[idx]);
        if (testResult === undefined) {
          return;
        }
        programPattern.push(testResult);
      }
      return {
        pattern: programPattern
      };
    }
    return result;
  }

  private extractTestResult(value: string): TestResult {
    let result: TestResult;
    value = this.normalizeInput(value);
    const pattern = /^\([0-9]+,(f|t|p).*\)$/;
    if (pattern.test(value) ) {
      const noBraces = value.replace(/(\(|\))/g, '');
      const noTruePass = noBraces.replace(/(t.*|p.*)/g, 'p');
      const noFalseFails = noTruePass.replace(/f.*/g, 'f');
      const numberResult = noFalseFails.split(',');
      const testNumber = parseInt(numberResult[0], 10);
      const passed = numberResult[1] === 'p';
      result = {
        testNumber,
        passed
      };
    }
    return result;
  }

  private normalizeInput(value: string): string {
    const lower = value.toLocaleLowerCase();
    const noSpaces = lower.replace(/\s*/g, '');
    return noSpaces;
  }

  private inputValid(value: string): boolean {
    const normalizedValue = this.normalizeInput(value);
    if (normalizedValue === '') {
      return true;
    }
    const dnfRegExp = /^\([0-9]+,(f|t|p).*\)((&&|\|{2})\([0-9]+,(f|t|p).*\))*$/;
    const result = dnfRegExp.test(normalizedValue);
    return result;
  }

  private updateDeviceId(id: string): void {
    this.deviceId = id;
    this.restoreSettings();
  }

  private subscribeDeviceId(): void {
    this.store.select(selectDeviceId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe( e => {
        this.updateDeviceId(e);
      }
    );
  }
}
