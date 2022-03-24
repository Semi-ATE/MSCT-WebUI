import { Component, Input } from '@angular/core';
import { CardConfiguration } from './card-config';

@Component({
  selector: 'lib-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {

  @Input()
  cardConfiguration: CardConfiguration;

  constructor() {
    this.cardConfiguration = new CardConfiguration();
  }
}
