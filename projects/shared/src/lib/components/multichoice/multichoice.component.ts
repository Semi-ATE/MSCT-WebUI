import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MultichoiceConfiguration } from './multichoice-config';

@Component({
  selector: 'lib-multichoice',
  templateUrl: './multichoice.component.html',
  styleUrls: ['./multichoice.component.scss']
})
export class MultichoiceComponent {

  @Input()
  multichoiceConfig: MultichoiceConfiguration;

  @Output()
  multichoiceChangeEvent: EventEmitter<void>;

  constructor() {
    this.multichoiceConfig = {
      readonly: false,
      label: '',
      items: []
    };
    this.multichoiceChangeEvent = new EventEmitter<void>();
  }

  changeItem(itemIndex: number): void {
    if (this.multichoiceConfig.readonly)
      return;
    this.multichoiceConfig.items[itemIndex].checked = !this.multichoiceConfig.items[itemIndex].checked;
    this.multichoiceChangeEvent.emit();
  }

}
