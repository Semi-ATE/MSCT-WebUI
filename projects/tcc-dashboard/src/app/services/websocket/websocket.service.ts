import { Injectable, Injector, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { BACKEND_MOCKED, DASHBOARD_BACKEND_URL } from '../../configurations/connection-settings';
import { TccMockServerService } from '../tcc-mock-server/tcc-mock-server.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements OnDestroy {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messageSubject: WebSocketSubject<any>;
  websocketErrorSubject$ = new BehaviorSubject<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private subject: WebSocketSubject<any>;
  private readonly mockServer: TccMockServerService;
  private readonly backendMocked = BACKEND_MOCKED;

  constructor(private readonly injector: Injector) {
    if (this.backendMocked) {
      this.mockServer = this.injector.get(TccMockServerService);
    }
    this.messageSubject = (
      this.connect(DASHBOARD_BACKEND_URL).pipe(
        catchError(_ => {
          throw this.websocketErrorSubject$.next(true);
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as WebSocketSubject<any>
    );
  }

  ngOnDestroy(): void {
    this.messageSubject.complete();
    this.subject.complete();
    this.mockServer?.ngOnDestroy();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  connect(url: string): WebSocketSubject<any> {
    if (!this.subject) {
      this.subject = webSocket(url);
    }
    return this.subject;
  }


  /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send(json: any): void {
    this.subject?.next(json);
  }
  /* eslint-enable @typescript-eslint/explicit-module-boundary-types */
}
