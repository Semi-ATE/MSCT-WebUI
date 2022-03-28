import { Component, OnInit, OnDestroy } from '@angular/core';
import { InputConfiguration } from 'shared';
import { Subject } from 'rxjs';
import { SdtfRecordFilter, FilterType } from './../../services/stdf-record-filter-service/stdf-record-filter';
import { Store } from '@ngrx/store';
import { AppState, selectDeviceId } from './../../app.state';
import { StdfRecordFilterService } from './../../services/stdf-record-filter-service/stdf-record-filter.service';
import { StorageMap } from '@ngx-pwa/local-storage';
import { StdfRecord, STDF_RESULT_RECORDS, STDF_RECORD_ATTRIBUTES } from './../../stdf/stdf-stuff';
import { takeUntil } from 'rxjs/operators';
import { SettingType, TestNumberFilterSetting } from './../../models/storage.model';
import { CheckboxConfiguration } from 'shared';

@Component({
  selector: 'app-stdf-record-test-number-filter',
  templateUrl: './stdf-record-test-number-filter.component.html',
  styleUrls: ['./stdf-record-test-number-filter.component.scss']
})

export class StdfRecordTestNumberFilterComponent implements OnInit, OnDestroy {

  testNumberCheckboxConfig: CheckboxConfiguration;
  testNumberInputConfig: InputConfiguration;
  private deviceId: string;
  private readonly unsubscribe: Subject<void>;
  private selectedtestNumbers: Array<number>;
  private readonly filter$: Subject<SdtfRecordFilter>;
  private readonly filter: SdtfRecordFilter;

  constructor(private readonly filterService: StdfRecordFilterService, private readonly storage: StorageMap, private readonly store: Store<AppState>) {
    this.testNumberCheckboxConfig = new CheckboxConfiguration();
    this.testNumberInputConfig = new InputConfiguration();
    this.deviceId = undefined;
    this.unsubscribe = new Subject<void>();
    this.selectedtestNumbers = [];
    this.filter$ = new Subject<SdtfRecordFilter>();
    this.filter = {
      active: false,
      filterFunction: (_e: StdfRecord): boolean => true,
      type: FilterType.TestNumber,
      strengthen: false
    };
  }

  ngOnInit(): void {
    this.filterService.registerFilter(this.filter$);
    this.updateFilterAndPublish(false);
    this.subscribeDeviceId();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    this.saveSettings();
  }

  filterChanged(): void {
    const selectedtestNumbers = this.computeTestNumbersOfInterest(this.testNumberInputConfig.value);
    this.testNumberInputConfig.disabled = !this.testNumberCheckboxConfig.checked;
    if (!selectedtestNumbers) {
      this.testNumberInputConfig.errorMsg = 'Input error. Valid values: 0 or 1,4 or 1,2-3,7 etc.';
    } else {
      this.testNumberInputConfig.errorMsg = '';
      const isSubset = this.isSubsetOfSelectedtestNumbers(selectedtestNumbers);
      this.selectedtestNumbers = selectedtestNumbers;
      this.updateFilterAndPublish(isSubset);
    }
    this.saveSettings();
    if (!this.testNumberCheckboxConfig.checked) {
      this.testNumberInputConfig.errorMsg = '';
    }
  }

  private updateFilterAndPublish(filterStronger: boolean): void {
    this.filter.active = this.testNumberCheckboxConfig.checked;
    this.filter.filterFunction = (r: StdfRecord): boolean => STDF_RESULT_RECORDS.includes(r.type) && r.values.some( k => k.key === STDF_RECORD_ATTRIBUTES.TEST_NUM && this.selectedtestNumbers.some(e => e === k.value));
    this.filter.strengthen = filterStronger;
    this.filter$.next(this.filter);
  }

  private computeTestNumbersOfInterest(text: string): number[] {
    const result: Set<number> = new Set<number>();
    text.split(',').forEach(e => {
      const testNumber = this.testNumberFromString(e);
      const testNumbers = this.testNumbersFromRange(e);
      if (testNumber === -1 && testNumbers.length > 0 ) {
        testNumbers.forEach(a => result.add(a));
      } else if (testNumber !== -1 && testNumbers.length === 0) {
        result.add(testNumber);
 } else {
        result.clear();
        return;
      }
    });
    // in case of any error return undefined
    if (result.size === 0) {
      if (text === '') {
        return [];
      }
      return;
    }
    return Array.from(result.values());
  }

  private isSubsetOfSelectedtestNumbers(selectedtestNumbers: number[]): boolean {
    return selectedtestNumbers.every( n => this.selectedtestNumbers.some(z => z === n));
  }

  private testNumberFromString(text: string): number {
    const pattern = /^[0-9]+$/;
    if (!pattern.test(text)) {
      return -1;
    }
    return parseInt(text, 10);
  }

  private testNumbersFromRange(text: string): number[] {
    const result: number[] = [];
    const pattern = /^[0-9]+-[0-9]+$/;
    if (!pattern.test(text)) {
      return result;
    }
    const numbers = text.split('-');
    const minNum = this.testNumberFromString(numbers[0]);
    const maxNum = this.testNumberFromString(numbers[1]);
    if (minNum !== -1 && maxNum !== -1 && minNum <= maxNum) {
      for (let num = minNum; num <= maxNum; ++num) {
        result.push(num);
      }
    }
    return result;
  }

  private defaultSettings(): void {
    this.selectedtestNumbers = [];
    this.testNumberCheckboxConfig.initCheckBox('Show only the following tests', false, false);
    this.testNumberInputConfig.initInput('Test numbers of interest', true, '', /([0-9]|,|-)/);
  }

  private restoreSettings(): void {
    this.storage.get(this.getStorageKey())
      .subscribe( e => {
        this.defaultSettings();
        const testFilterSetting = e as TestNumberFilterSetting;
        if (testFilterSetting && typeof testFilterSetting.selectedTestNumbers === 'string' && typeof testFilterSetting.enabled === 'boolean' ) {
          this.testNumberCheckboxConfig.checked = testFilterSetting.enabled;
          this.testNumberInputConfig.disabled = !testFilterSetting.enabled;
          this.testNumberInputConfig.value = testFilterSetting.selectedTestNumbers;
          this.filterChanged();
        }
      });
  }

  private saveSettings(): void {
    const setting: TestNumberFilterSetting = {
      selectedTestNumbers: this.testNumberInputConfig.value,
      enabled: this.testNumberCheckboxConfig.checked
    };
    this.storage.set(this.getStorageKey(), setting).subscribe( () => true);
  }

  private getStorageKey(): string {
    return `${this.deviceId}${SettingType.TestNumberFilter}`;
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
