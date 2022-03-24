/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { TccMockServerService } from '../tcc-mock-server/tcc-mock-server.service';
import { WebsocketService } from './websocket.service';

describe('WebsocketService', () => {
  let service: WebsocketService;
  let mockserverService: TccMockServerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebsocketService]
    });
    mockserverService = TestBed.inject(TccMockServerService);
    service = TestBed.inject(WebsocketService);
  });

  afterEach(() => {
    service.ngOnDestroy();
    mockserverService.ngOnDestroy();
  });

  it('should be created a WebsocketService instance', () => {
    expect(service).toBeTruthy();
  });

  describe('Mockserver instance', () => {
    it('should be undefined', () => {
      expect((service as any).mockserver).toBeUndefined();
    });

    it('should be injected', () => {
      (service as any).mockserver = mockserverService;
      expect((service as any).mockserver).toBeDefined();
      expect((service as any).mockserver.ngOnDestroy()).toBeUndefined();
    });
  });

  describe('connect', () => {
    it('should return existing subject when called for the second time', () => {
      const resultFirst = service.connect('127.0.0.1');
      const resultSecond = service.connect('127.0.0.1');
      expect(resultFirst).toBe(resultSecond);
    });
  });

  describe('sendMsgToServer', () => {
    it('should call next function of the websocketsubject', () => {
      service.connect('127.0.0.1');
      const argument = {
        key: 'value'
      };

      const spySubject = spyOn<any>((service as any).subject, 'next').and.callFake(param => {
        return argument[param];
      });
      service.send(argument);
      expect(spySubject).toHaveBeenCalled();
    });
  });
});
