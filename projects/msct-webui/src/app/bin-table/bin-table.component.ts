import { Component, OnDestroy, OnInit } from '@angular/core';
import { getSiteName } from '../stdf/stdf-stuff';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { BinTableData } from '../models/bintable.model';
import { Status } from '../models/status.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommunicationService } from '../services/communication.service';
import { CardConfiguration, CardStyle } from 'shared';
import { Alignment, generateTableEntry, TableConfiguration, TableEntry } from 'shared';

@Component({
  selector: 'app-bin-table',
  templateUrl: './bin-table.component.html',
  styleUrls: ['./bin-table.component.scss']
})
export class BinTableComponent implements OnInit, OnDestroy {
  captionCardConfiguration: CardConfiguration;
  tableCardConfiguration: CardConfiguration;
  binTableConfiguration: TableConfiguration;
  binTable: BinTableData;
  binTableHeaders = new Array<string>();

  private status: Status;
  private readonly unsubscribe: Subject<void>;

  constructor(private readonly communicationService: CommunicationService, private readonly store: Store<AppState>) {
    this.captionCardConfiguration = new CardConfiguration();
    this.tableCardConfiguration = new CardConfiguration();
    this.binTableConfiguration = new TableConfiguration();
    this.binTable = [];
    this.status = undefined;
    this.unsubscribe = new Subject<void>();
  }

  ngOnInit(): void {
    this.initCardElements();

    this.store.select('systemStatus')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(s => this.updateStatus(s));

    this.store.select('binTable')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(y => this.updateBinTable(y));
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  private initCardElements(): void {
    this.captionCardConfiguration.cardStyle = CardStyle.COLUMN_STYLE_FOR_COMPONENT;
    this.captionCardConfiguration.labelText = 'Bin Table';
    this.tableCardConfiguration.cardStyle = CardStyle.COLUMN_STYLE;
    this.tableCardConfiguration.shadow = true;
  }

  private updateStatus(status: Status): void {
    if (status.sites.length !== this.status?.sites?.length) {
      this.status = status;
      this.computeBinTable();
    }
  }

  private updateBinTable(table: BinTableData): void {
    this.binTable = table;
    this.computeBinTable();
  }

  private computeBinTable(): void {
    this.computeHeaderLabelsAndWidth();
    this.binTableConfiguration.rows = [];
    this.binTableConfiguration.rows = this.computeTableRows();
  }

  private computeHeaderLabelsAndWidth(): void {
    this.computeTableHeaderLabels();

    const widths = [
      '150px', // bin-name column
      '80px',  // soft-bin column
      '85px',  // hard-bin column
      '160px', // type column
      '85px'   // total column
    ];
    for (let i = 0; i < this.status.sites.length; ++i) {
      widths.push('75px');
    }
    this.binTableConfiguration.tableWidth = widths;
    this.binTableConfiguration.headerRow = this.computeTableHeaderRow();
  }

  private computeTableHeaderLabels(): void {
    this.binTableHeaders = [
      'Name',
      'Soft Bin',
      'Hard Bin',
      'Type',
      'Total'
    ];
    for (let i = 0; i < this.status.sites.length; ++i) {
      this.binTableHeaders.push(`Site ${getSiteName(i)}`);
    }
  }

  private computeTableHeaderRow(): Array<TableEntry> {
    return this.binTableHeaders.map(e => {
      let alignment = Alignment.Right;
      if (e === 'Name') {
        alignment = Alignment.Left;
      }
      return generateTableEntry(e, { align: alignment });
    });
  }

  private computeTableRows(): Array<Array<TableEntry>> {
    const result = new Array<Array<TableEntry>>();
    for (let i = 0; i < this.binTable.length; ++i) {
      result.push(this.computeTableRow(i));
    }
    return result;
  }

  private computeTableRow(index: number): Array<TableEntry> {
    const binEntryOfRow = this.binTable[index];
    const texts = [
      binEntryOfRow.name,
      binEntryOfRow.sBin.toString(),
      binEntryOfRow.hBin.toString(),
      binEntryOfRow.type,
      binEntryOfRow.siteCounts.slice(0, this.status.sites.length).reduce((s, c) => s + c.count, 0).toString()
    ];

    for (let i = 0; i < this.status.sites.length; ++i) {
      texts.push(binEntryOfRow.siteCounts[i].count.toString());
    }

    return texts.map((e, i) => {
      if (i === 0) {
        return generateTableEntry(e, { align: Alignment.Left });
      }
      if (i === 2) {
        return generateTableEntry(e, { align: Alignment.Left },
          {
            editable: true,
            onUserInput: (value: string) => {
              this.sendHardBin(texts[1], value);
            },
            valid: (value: string)  => {
              if (/[0-9]*/.test(value)) {
                const VALUE = parseInt(value, 10);
                if (VALUE > -1 && VALUE < 65536) {
                  return true;
                }
              }
              return false;
            }
          });
      } else {
        return generateTableEntry(e, { align: Alignment.Right });
      }
    });
  }

  private sendHardBin(softBin: string, hardBin: string): void {
    this.communicationService.send(
      {
        type: 'cmd',
        command: 'binMap',
        sBin: parseInt(softBin, 10),
        hBin: parseInt(hardBin, 10)
      });
  }
}
