import { Component, Input } from '@angular/core';
import { TableConfiguration, TableEntry } from './table-config';

@Component({
  selector: 'lib-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent {

  @Input() tableConfig: TableConfiguration;

  constructor() {
    this.tableConfig = new TableConfiguration();
  }

  inputFieldEditable(entry: TableEntry): boolean {
    if (entry.callBack?.editable) {
      return true;
    } else {
      return false;
    }
  }

  onInput(entry: TableEntry, value: string): void {
    entry.text = value;
    if (entry.callBack?.valid(value)) {
      entry.callBack.onUserInput(value);
    }
  }
}
