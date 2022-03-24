import { Component, OnInit, OnDestroy } from '@angular/core';
import { InputConfiguration } from 'shared';
import { Status } from '../../models/status.model';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.state';
import { takeUntil } from 'rxjs/operators';
import { SdtfRecordFilter, FilterType } from '../../services/stdf-record-filter-service/stdf-record-filter';
import { StdfRecord, STDF_RECORD_ATTRIBUTES } from '../../stdf/stdf-stuff';
import { StdfRecordFilterService } from '../../services/stdf-record-filter-service/stdf-record-filter.service';
import { SettingType, SiteNumberFilterSetting } from '../../models/storage.model';
import { StorageMap } from '@ngx-pwa/local-storage';
import { CheckboxConfiguration } from 'shared';

@Component({
  selector: 'app-stdf-record-site-number-filter',
  templateUrl: './stdf-record-site-number-filter.component.html',
  styleUrls: ['./stdf-record-site-number-filter.component.scss']
})
export class StdfRecordSiteNumberFilterComponent implements OnInit, OnDestroy {

  siteNumberCheckboxConfig: CheckboxConfiguration;
  siteNumberInputConfig: InputConfiguration;
  private maxSiteNumber: number;
  private status: Status;
  private readonly unsubscribe: Subject<void>;
  private selectedSiteNumbers: Array<number>;
  private readonly filter$: Subject<SdtfRecordFilter>;
  private readonly filter: SdtfRecordFilter;

  constructor(private readonly store: Store<AppState>, private readonly filterService: StdfRecordFilterService, private readonly storage: StorageMap) {
    this.siteNumberCheckboxConfig = new CheckboxConfiguration();
    this.siteNumberInputConfig = new InputConfiguration();
    this.maxSiteNumber = 0;
    this.status = undefined;
    this.unsubscribe = new Subject<void>();
    this.selectedSiteNumbers = [];
    this.filter$ = new Subject<SdtfRecordFilter>();
    this.filter = {
      active: false,
      filterFunction: (_e: StdfRecord): boolean => true,
      type: FilterType.SiteNumber,
      strengthen: false
    };
  }

  ngOnInit(): void {
    this.filterService.registerFilter(this.filter$);
    this.updateFilterAndPublish(false);
    this.subscribeStore();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  filterChanged(): void {
    this.siteNumberInputConfig.disabled = !this.siteNumberCheckboxConfig.checked;
    const currentValue = this.siteNumberInputConfig.value;
    const selectedSiteNumbers = this.computeSitesOfInterest(currentValue, 0, this.maxSiteNumber);
    if (selectedSiteNumbers === undefined) {
      this.siteNumberInputConfig.errorMsg = 'Input error. Valid values: 0 or 1,4 or 1,2-3,7 etc. Max site number is ' + this.maxSiteNumber + '.';
    } else {
      this.siteNumberInputConfig.errorMsg = '';
      const isSubset = this.isSubsetOfSelectedSiteNumbers(selectedSiteNumbers);
      this.selectedSiteNumbers = selectedSiteNumbers;
      this.updateFilterAndPublish(isSubset);
    }
    this.saveSettings();
    if (!this.siteNumberCheckboxConfig.checked) {
      this.siteNumberInputConfig.errorMsg = '';
    }
  }

  private updateFilterAndPublish(filterStronger: boolean): void {
    this.filter.active = this.siteNumberCheckboxConfig.checked;
    this.filter.filterFunction = (r: StdfRecord): boolean => r.values.some( k => k.key === STDF_RECORD_ATTRIBUTES.SITE_NUM && this.selectedSiteNumbers.some(e => e === k.value));
    this.filter.strengthen = filterStronger;
    this.filter$.next(this.filter);
  }

  private subscribeStore(): void {
    this.store.select('systemStatus')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe( s => {
        this.updateStatus(s);
        this.getMaxSiteNumber(s);
      }
    );
  }

  private computeSitesOfInterest(text: string, minSiteNumber = 0, maxSiteNumber: number): number[] {
    const result: Set<number> = new Set<number>();
    text.split(',').forEach(e => {
      const siteNumber = this.siteNumberFromString(e, minSiteNumber, maxSiteNumber);
      const siteNumbers = this.siteNumbersFromRange(e, minSiteNumber, maxSiteNumber);
      if (siteNumber === -1 && siteNumbers.length > 0 ) {
        siteNumbers.forEach(a => result.add(a));
      } else if (siteNumber !== -1 && siteNumbers.length === 0) {
        result.add(siteNumber);
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

  private getMaxSiteNumber(status: Status): void {
    if (status) {
      this.status = status;
      if (this.maxSiteNumber !== (this.status.sites.length - 1)) {
        this.siteNumberInputConfig.value = `0-${this.status.sites.length - 1}`;
      }
      this.maxSiteNumber = this.status.sites.length - 1;
    }
  }

  private isSubsetOfSelectedSiteNumbers(selectedSiteNumbers: number[]): boolean {
    return selectedSiteNumbers.every( n => this.selectedSiteNumbers.some(z => z === n));
  }

  private siteNumberFromString(text: string, minSiteNumber = 0, maxSiteNumber: number): number {
    const pattern = /^[0-9]+$/;
    if (!pattern.test(text)) {
      return -1;
    }
    const num = parseInt(text, 10);
    if (num <= maxSiteNumber && num >= minSiteNumber) {
      return num;
    }
    return -1;
  }

  private siteNumbersFromRange(text: string, minSiteNumber = 0, maxSiteNumber: number): number[] {
    const result: number[] = [];
    const pattern = /^[0-9]+-[0-9]+$/;
    if (!pattern.test(text)) {
      return result;
    }
    const numbers = text.split('-');
    const minNum = this.siteNumberFromString(numbers[0], minSiteNumber, maxSiteNumber);
    const maxNum = this.siteNumberFromString(numbers[1], minSiteNumber, maxSiteNumber);
    if (minNum !== -1 && maxNum !== -1 && minNum <= maxNum) {
      for (let num = minNum; num <= maxNum; ++num) {
        result.push(num);
      }
    }
    return result;
  }

  private defaultSettings(): void {
    this.selectedSiteNumbers = Array.from(Array(this.maxSiteNumber + 1).keys());
    this.siteNumberCheckboxConfig.initCheckBox('Show only the following sites', false, false);
    this.siteNumberInputConfig.initInput('Site numbers of interest', true, `0-${this.maxSiteNumber}`, /([0-9]|,|-)/);
  }

  private restoreSettings(): void {
    this.storage.get(this.getStorageKey())
      .subscribe( e => {
        this.defaultSettings();
        const siteFilterSetting = e as SiteNumberFilterSetting;
        if (siteFilterSetting && typeof siteFilterSetting.selectedSites === 'string' && typeof siteFilterSetting.enabled === 'boolean' ) {
          this.siteNumberCheckboxConfig.checked = siteFilterSetting.enabled;
          this.siteNumberInputConfig.disabled = !siteFilterSetting.enabled;
          this.siteNumberInputConfig.value = siteFilterSetting.selectedSites;
          this.filterChanged();
        }
      });
  }

  private saveSettings(): void {
    const setting: SiteNumberFilterSetting = {
      selectedSites: this.siteNumberInputConfig.value,
      enabled: this.siteNumberCheckboxConfig.checked
    };
    this.storage.set(this.getStorageKey(), setting).subscribe( () => true);
  }

  private getStorageKey(): string {
    return `${this.status.deviceId}${SettingType.SiteNumberFilter}`;
  }

  private updateStatus(status: Status): void {
    if (this.status?.deviceId !== status.deviceId) {
      this.status = status;
      this.restoreSettings();
    }
    this.status = status;
  }
}
