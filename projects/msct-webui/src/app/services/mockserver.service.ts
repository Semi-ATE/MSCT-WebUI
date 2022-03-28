import { Injectable, OnDestroy } from '@angular/core';
import { Server, Client } from 'mock-socket';
import { interval, Observable, Subscription } from 'rxjs';
import * as constants from '../services/mockserver-constants';
import { formatDate } from '@angular/common';
import { BACKEND_URL_RUNNING_IN_PYTHON_MASTER_APPLICATION } from '../constants';

@Injectable({providedIn: 'root'})
export class MockServerService implements OnDestroy {
  private mockServer: Server;
  private timer: Observable<number>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private msgs: any[];
  private currentIndex: number;
  private repeatMessages: boolean;
  private updateTime: boolean;
  private timerSubscription: Subscription;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.msgs = new Array<any>();
    this.repeatMessages = false;
    this.updateTime = true;
    this.makeReadyForTest();
    this.setSendMessageInterval(50);
  }

  setSendMessageInterval(milliseconds: number): void {
    if (typeof(this.timer) !== 'undefined') {
      this.timerSubscription?.unsubscribe();
    }

    this.timer = interval(milliseconds);
    this.mockServer.on('connection', socket => {
      this.timerSubscription = this.timer.subscribe( () => {
        this.sendMsg(socket);
      });
    });
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.mockServer.close();
    document.getElementById(constants.MOCK_SEVER_SERVICE_NEVER_REMOVABLE_ID).remove();
  }

  /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appendMessage(message: any): void {
    this.msgs.push(message);
  }
  /* eslint-enable @typescript-eslint/explicit-module-boundary-types */

  clearMessages(): void {
    this.setMessages([]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setMessages(messages: Array<any>): void {
    this.currentIndex = 0;
    this.msgs = messages;
  }

  setRepeatMessages(repeat: boolean): void {
    this.repeatMessages = repeat;
  }

  setUpdateTime(updateTime: boolean): void {
    this.updateTime = updateTime;
  }

  private makeReadyForTest(): void {
    const div = document.createElement('div');
    div.setAttribute('id', constants.MOCK_SEVER_SERVICE_NEVER_REMOVABLE_ID);
    div.innerHTML = 'MOCK SERVER SERVICE IS RUNNING';
    document.body.appendChild(div);
    div.style.position = 'absolute';
    div.style.zIndex = '10000';
    div.style.top = '50px';
    div.style.color = 'red';
    div.style.left = '40%';
    setInterval(() => {
      div.style.opacity = div.style.opacity === '0' ? '1' : '0';
    }, 500);
    this.mockServer = new Server(BACKEND_URL_RUNNING_IN_PYTHON_MASTER_APPLICATION);
  }

  private sendMsg(socket: Client): void {
    if (this.currentIndex >= this.msgs.length) {
      if (this.repeatMessages) {
        this.currentIndex = 0;
      } else {
        // stop sending messages, i.e. we don't send something
        return;
      }
    }

    if (this.indexValid()) {
      this.addTimeToMsg();
      socket.send(JSON.stringify(this.msgs[this.currentIndex]));
    }

    this.currentIndex++;
  }

  private indexValid(): boolean {
    return (this.msgs.length !== 0 && this.currentIndex < this.msgs.length);
  }

  private addTimeToMsg(): void {
    if (this.indexValid() &&  this.updateTime) {
      const msg = this.msgs[this.currentIndex];
      if (!msg.payload) {
        msg.payload = {};
      }
      msg.payload.systemTime = formatDate(Date.now(), 'medium', 'en-US');
    }
  }
}
