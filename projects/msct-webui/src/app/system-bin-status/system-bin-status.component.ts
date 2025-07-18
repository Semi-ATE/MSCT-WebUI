import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Component } from '@angular/core';
import { AppState } from '../app.state';
import { Status } from './../models/status.model';

@Component({
  selector: 'app-system-bin-status',
  templateUrl: './system-bin-status.component.html',
  styleUrls: ['./system-bin-status.component.scss'],
})
export class SystemBinStatusComponent {
  status$: Observable<Status>;

  constructor(private readonly _Store: Store<AppState>) {
    this.status$ = this._Store.pipe(select('systemStatus'));
  }
}
