import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CheckboxConfiguration } from './checkbox-config';

@Component({
  selector: 'lib-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent {

  @Input() checkboxConfig: CheckboxConfiguration;
  @Output() checkboxChangeEvent: EventEmitter<boolean>;

  checkboxValueChange(checkboxValue: boolean): void {
    this.checkboxChangeEvent.emit(checkboxValue);
  }

  constructor() {
    this.checkboxConfig = new CheckboxConfiguration();
    this.checkboxChangeEvent = new EventEmitter<boolean>();
  }

}
