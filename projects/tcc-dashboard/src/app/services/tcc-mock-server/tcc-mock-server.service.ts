import { Injectable, OnDestroy } from '@angular/core';
import { Client, Server } from 'mock-socket';
import { Subject } from 'rxjs';
import { DASHBOARD_BACKEND_URL } from '../../configurations/connection-settings';
import * as MOCK from './tcc-mock-server-constants';

@Injectable({
  providedIn: 'root'
})
export class TccMockServerService implements OnDestroy {
  private readonly mockServer: Server;
  private readonly unsubscribe = new Subject<void>();
  private socket: Client;

  constructor() {
    this.mockServer = new Server(DASHBOARD_BACKEND_URL);
    this.mockServer.on('connection', ((socket: Client) => {
      this.socket = socket;
      socket.on('message', data => {
        this.handleMessage(data);
      });
    }));
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    this.mockServer.close();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleMessage(data: any): void {
    const jsonData = JSON.parse(data);

    switch (jsonData?.payload?.command) {
      case MOCK.LOG_COMMAND_SENT_TO_SERVER.payload.command:
        this.handleGetLogs();
        break;
      case MOCK.GET_TEST_CELL_COMPONENTS_COMMAND.payload.command:
        this.handleGetTestcellComponents();
        break;
      case MOCK.LOAD_LOT_COMMAND_SENT_TO_SERVER.payload.command:
        this.handleLoadLot();
        break;
      case MOCK.UNLOAD_LOT_COMMAND_SENT_TO_SERVER.payload.command:
        this.handleUnloadLot();
        break;
      default:
        break;
    }
  }

  private handleGetLogs(): void {
    this.socket.send(JSON.stringify(MOCK.LOG_ENTRIES));
  }

  private handleGetTestcellComponents(): void {
    this.socket.send(JSON.stringify(MOCK.TESTCELL_COMPONENTS_ENTRIES));
  }

  private handleLoadLot(): void {
    const msg = [MOCK.SUPERVISOR_STATE_BUSY, MOCK.CAMADAPTOR_STATE_BUSY, MOCK.MSCTADAPTOR_STATE_BUSY];
    this.sendMessage(msg);
  }

  private handleUnloadLot(): void {
    const msg = [MOCK.SUPERVISOR_STATE_READY, MOCK.CAMADAPTOR__STATE_READY, MOCK.MSCTADAPTOR__STATE_READY];
    this.sendMessage(msg);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sendMessage(message: Array<any>): void {
    for (let i = 0; i < message.length; ++i) {
      this.socket.send(JSON.stringify(message[i]));
    }
  }
}
