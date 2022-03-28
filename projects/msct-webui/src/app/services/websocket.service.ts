import { Injectable, Injector, OnDestroy } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { BACKEND_MOCKED } from '../constants';
import { MockServerService } from './mockserver.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements OnDestroy {


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private subject: WebSocketSubject<any>;

  private readonly mockServer: MockServerService;
  private readonly backendMocked = BACKEND_MOCKED;

  constructor(private readonly injector: Injector) {
    if (this.backendMocked) {
      this.mockServer = this.injector.get(MockServerService);
    }
  }

  ngOnDestroy(): void {
    this.subject?.complete();
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
    this.subject.next(json);
  }
  /* eslint-enable @typescript-eslint/explicit-module-boundary-types */
}
