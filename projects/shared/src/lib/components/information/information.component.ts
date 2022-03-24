import { Component, Input } from '@angular/core';
import { InformationConfiguration } from './information-config';

@Component({
  selector: 'lib-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent {
  @Input() informationConfig: InformationConfiguration;

  constructor() {
    this.informationConfig = new InformationConfiguration();
   }

  informationConfigValueType(): string {
    return typeof this.informationConfig.value;
  }
}
