import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { CardConfiguration, CardStyle } from 'shared';
import { TabConfiguration } from 'shared';
import { Alignment, generateTableEntry, TableConfiguration } from 'shared';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppState } from '../app.state';
import { Status } from '../models/status.model';
import { SettingType, YieldSetting } from '../models/storage.model';
import { YieldData } from '../models/yield.model';
import { getSiteName } from '../stdf/stdf-stuff';

@Component({
  selector: 'app-yield',
  templateUrl: './yield.component.html',
  styleUrls: ['./yield.component.scss']
})
export class YieldComponent implements OnInit, OnDestroy {
  yieldCardConfiguration: CardConfiguration;
  yieldTabConfiguration: TabConfiguration;
  yieldTableConfiguration: TableConfiguration;
  private yieldData: YieldData;
  private status: Status;
  private readonly unsubscribe: Subject<void>;

  constructor(private readonly store: Store<AppState>, private readonly storage: StorageMap) {
    this.yieldCardConfiguration = new CardConfiguration();
    this.yieldTabConfiguration = new TabConfiguration();
    this.yieldTableConfiguration = new TableConfiguration();
    this.yieldData = [];
    this.status = undefined;
    this.unsubscribe = new Subject<void>();
  }

  ngOnInit(): void {
    this.initElements();
    this.store.select('systemStatus')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe( s => this.updateStatus(s));

    this.store.select('yield')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe( y => this.updateYieldData(y));

    this.yieldCardConfiguration.initCard(true, CardStyle.COLUMN_STYLE, 'Yield');
    this.restoreSelectedTabIndex();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  tabChanged(): void {
    this.updateYieldTable();
    this.saveSettings();
  }

  yieldDataAvailable(): boolean {
    return this.yieldData.length > 0;
  }

  private computeSiteIdFromSelectedTabIndex(): string {
    return (this.yieldTabConfiguration.selectedIndex === 0) ? '-1' : (this.yieldTabConfiguration.selectedIndex - 1).toString();
  }

  private updateStatus(status: Status): void {
    this.status = status;
    this.updateYieldTab();
  }

  private updateYieldTab(): void {
    const tabLabels = ['Total'];
    for (let i = 0; i < this.status.sites.length; ++i) {
      tabLabels.push(getSiteName(i));
    }
    this.yieldTabConfiguration.labels = tabLabels;
  }

  private updateYieldData(data: YieldData): void {
    this.yieldData = data;
    this.updateYieldTable();
  }

  private updateYieldTable(): void {
    const rowsOfInterest = this.yieldData.filter(e => e.siteid === this.computeSiteIdFromSelectedTabIndex());

    this.yieldTableConfiguration.rows = [];
    rowsOfInterest.forEach(e => {
      this.yieldTableConfiguration.rows.push(
        [
          generateTableEntry(e.name, {}),
          generateTableEntry(e.count.toString(), {align: Alignment.Right}),
          generateTableEntry(e.name === 'Sum' ? '' : e.value.toString(), {align: Alignment.Right})]
      );
    });
  }

  private restoreSelectedTabIndex(): void {
    this.yieldTabConfiguration.selectedIndex = 0;
    this.storage.get(this.getStorageKey())
      .subscribe(e => {
        const yieldSetting = e as YieldSetting;
        if (yieldSetting && typeof yieldSetting.selectedTabIndex === 'number') {
          this.yieldTabConfiguration.selectedIndex = yieldSetting.selectedTabIndex;
          this.tabChanged();
        }
      }
    );
  }

  private initElements(): void {
    this.yieldTabConfiguration.initTab([false], ['Total'], 0);
    this.yieldTableConfiguration.initTable(
      [
        generateTableEntry('', {}),
        generateTableEntry('Amount', {align: Alignment.Right}),
        generateTableEntry('Percentage', {align: Alignment.Right})
      ],
      [],
      ['40%', '30%', '30%']
    );
  }

  private saveSettings(): void {
    const setting: YieldSetting = {
      selectedTabIndex: this.yieldTabConfiguration.selectedIndex
    };
    this.storage.set(this.getStorageKey(), setting).subscribe(() => true);
  }

  private getStorageKey(): string {
    return `${this.status.deviceId}${SettingType.Yield}`;
  }
}
