import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonConfiguration } from './button-config';

@Component({
  selector: 'lib-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() buttonConfig: ButtonConfiguration;
  @Output() buttonClickEvent: EventEmitter<boolean>;

  onClickButton(): void {
    this.buttonClickEvent.emit(true);
  }

  constructor() {
    this.buttonConfig = new ButtonConfiguration();
    this.buttonClickEvent = new EventEmitter<boolean>();
  }
}
