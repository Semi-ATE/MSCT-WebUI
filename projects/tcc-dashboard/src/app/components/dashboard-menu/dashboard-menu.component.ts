import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TccMenuItem } from '../../modules/app-routing.module';

@Component({
  selector: 'app-dashboard-menu',
  templateUrl: './dashboard-menu.component.html',
  styleUrls: ['./dashboard-menu.component.scss']
})
export class DashboardMenuComponent {
  menuItem = TccMenuItem;

  constructor(private readonly router: Router) { }

  isActive(path: string): boolean {
    return this.router.url === '/' + path;
  }
}
