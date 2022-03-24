import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() title: string;

  constructor() {
    this.title = '';
  }
}
