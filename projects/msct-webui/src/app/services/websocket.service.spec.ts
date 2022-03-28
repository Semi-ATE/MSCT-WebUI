/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { WebsocketService } from './websocket.service';
import { MockServerService } from './mockserver.service';
import { spyOnStoreArguments } from 'shared';

describe('WebsocketService', () => {
  let service: WebsocketService;
  let mockServer: MockServerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebsocketService ]
    });
    mockServer = TestBed.inject(MockServerService);
    service = TestBed.inject(WebsocketService);
  });

  afterEach(() => {
    mockServer.ngOnDestroy();
  });

  it('should create a WebsocketService instance', () => {
    expect(service).toBeDefined();
  });

  describe('connect', () => {
    it('should return existing subject when called for the second time', () => {
      const resultFirst = service.connect('127.0.0.1');
      const resultSecond = service.connect('127.0.0.1');
      expect(resultFirst).toBe(resultSecond);
    });
  });

  describe('send', () => {
    it('should call next function of the websocketsubject', () => {
      service.connect('127.0.0.1');
      const nextArguments = [];
      const spySubject = spyOnStoreArguments((service as any).subject, 'next', nextArguments);
      service.send({key: 'Value'});
      expect(spySubject).toHaveBeenCalled();
      expect(nextArguments[0].key).toEqual('Value');
    });
  });
});
