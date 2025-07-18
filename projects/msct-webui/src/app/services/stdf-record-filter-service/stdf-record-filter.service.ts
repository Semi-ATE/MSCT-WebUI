import { Injectable, OnDestroy } from '@angular/core';
import { StdfRecord } from '../../stdf/stdf-stuff';
import { SdtfRecordFilter, FilterFunction, SdtfRecordProgramFilter } from './stdf-record-filter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppstateService } from '../appstate.service';

@Injectable({
  providedIn: 'root'
})
export class StdfRecordFilterService implements OnDestroy {
  resultChanged$: Subject<void>;
  newResultsAvailable$: Subject<void>;
  filteredRecords: Array<StdfRecord[]>;
  private filters: SdtfRecordFilter[];
  private programFilter: SdtfRecordProgramFilter;
  private readonly unsubscribe$: Subject<void>;

  constructor(private readonly appStateService: AppstateService) {
    this.resultChanged$ = new Subject<void>();
    this.newResultsAvailable$ = new Subject<void>();
    this.filteredRecords = [];
    this.filters = [];
    this.programFilter = {
      filterFunction: (_e: StdfRecord[]): boolean => true,
      active: false
    };
    this.unsubscribe$ = new Subject<void>();
    this.appStateService.newRecordReceived$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({next: (newRecords: StdfRecord[]) => this.updateFilteredRecords(newRecords)});
    this.appStateService.rebuildRecords$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        {
          next: () => {
            this.applyAllFilters();
            this.resultChanged$.next();
            this.newResultsAvailable$.next();
          }
        }
      );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  registerFilter(filter: Subject<SdtfRecordFilter>): void {
    filter.pipe(takeUntil(this.unsubscribe$)).subscribe(f => this.manageFilterChange(f));
  }

  registerProgramFilter(filter: Subject<SdtfRecordProgramFilter>): void {
    filter.pipe(takeUntil(this.unsubscribe$)).subscribe( f => this.manageProgramFilterChange(f));
  }

  clearFilters(): void {
    this.filters = [];
  }

  private updateFilteredRecords(toAdd: StdfRecord[]): void {
    if (this.matchesProgramPattern(toAdd)) {
      const toAddFiltered = toAdd.filter(this.combineActiveFilters());
      if (toAddFiltered.length > 0) {
        this.filteredRecords.push(toAddFiltered);
        this.newResultsAvailable$.next();
      }
    }
  }

  private manageFilterChange(filter: SdtfRecordFilter): void {
    const strengthen = this.addFilter(filter);
    if (strengthen) {
      this.updateByFilter(filter);
    } else {
      this.applyAllFilters();
    }
    this.resultChanged$.next();
  }

  private manageProgramFilterChange(filter: SdtfRecordProgramFilter): void {
    this.programFilter = filter;
    this.applyAllFilters();
    this.resultChanged$.next();
  }

  private updateByFilter(filter: SdtfRecordFilter): void {
    if (!filter.active) {
      throw new Error('Filter must be active in order to strengthen the current result');
    }
    const filterResult = new Array<StdfRecord[]>();
    for (let idx = 0; idx < this.filteredRecords.length; idx++) {
      const temp = this.filteredRecords[idx].filter( this.combineActiveFilters());
      if (temp.length > 0) {
        filterResult.push(temp);
      }
    }
    this.filteredRecords = filterResult;
  }

  private addFilter(filter: SdtfRecordFilter): boolean {
    let filterGetStronger = false;
    const foundFilter = this.filters.find(e => e.type === filter.type);
    if (!foundFilter) {
      this.filters.push(filter);
    } else {
      this.filters[this.filters.findIndex(e => e.type === filter.type)] = filter;
    }
    filterGetStronger = filter.active && filter.strengthen;
    return filterGetStronger;
  }

  private applyAllFilters(): void {
    this.filteredRecords = [];
    for (let idx = 0; idx < this.appStateService.stdfRecords.length; ++idx) {
      if ( this.matchesProgramPattern(this.appStateService.stdfRecords[idx])) {
        const temp = this.appStateService.stdfRecords[idx].filter( this.combineActiveFilters());
        if (temp.length > 0) {
          this.filteredRecords.push(temp);
        }
      }
    }
  }

  private combineActiveFilters(): FilterFunction {
    const activeFilters = this.filters.filter(f => f.active);
    return activeFilters.reduce( (a, f) => (r: StdfRecord): boolean => a(r) && f.filterFunction(r), (_e: StdfRecord) => true);
  }

  private matchesProgramPattern(programResult: StdfRecord[]): boolean {
    if (this.programFilter.active) {
      const result = this.programFilter.filterFunction(programResult);
      return result;
    }
    return true;
  }
}
