import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WEBSOCKET_CONNECTION_ERROR } from './configurations/connection-settings';
import { TccStateService } from './services/tcc-state/tcc-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title: string;
  websocketError$: BehaviorSubject<boolean>;
  connectionError: string;

  constructor(readonly tccStateService: TccStateService) {
    this.title = 'Tcc Dashboard';
    this.websocketError$ = tccStateService.websocketErrorSubject$;
    this.connectionError = WEBSOCKET_CONNECTION_ERROR;
  }
}
