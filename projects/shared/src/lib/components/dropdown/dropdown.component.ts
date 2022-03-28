import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DropdownConfiguration, DropdownItemValueType } from './dropdown-config';

@Component({
  selector: 'lib-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent {

  @Input() dropdownConfig: DropdownConfiguration;
  @Output() dropdownChangeEvent: EventEmitter<DropdownItemValueType>;

  constructor() {
    this.dropdownConfig = new DropdownConfiguration();
    this.dropdownChangeEvent = new EventEmitter<DropdownItemValueType>();
  }

  selectedItem(selectedItemIndex: number): void {
    if (this.dropdownConfig.disabled) {
      return;
    }
    if (this.dropdownConfig.closed) {
      this.dropdownConfig.closed = false;
    } else {
      this.dropdownConfig.closed = true;
      if (selectedItemIndex !== this.dropdownConfig.selectedIndex) {
        this.dropdownConfig.selectedIndex = selectedItemIndex;
        this.dropdownConfig.value = this.dropdownConfig.items[this.dropdownConfig.selectedIndex].value;
        this.dropdownChangeEvent.emit(this.dropdownConfig.value);
      }
    }
  }

}
