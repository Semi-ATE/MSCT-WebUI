/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { DASHBOARD_BACKEND_URL } from '../../configurations/connection-settings';
import { WebsocketService } from '../websocket/websocket.service';
import * as MOCK from './tcc-mock-server-constants';
import { TccMockServerService } from './tcc-mock-server.service';

describe('MockserverService', () => {
  let service: TccMockServerService;
  let websocketService: WebsocketService;
  const wsMessage = {
    topic: 'test',
    payload: {
      command: 'GetLogs',
      payload: {}
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TccMockServerService);
    websocketService = TestBed.inject(WebsocketService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should be created a MockserverService', () => {
    expect(service).toBeTruthy();
  });

  it('should connect to backendend url', () => {
    expect((service as any).mockServer.url).toEqual(DASHBOARD_BACKEND_URL);
  });

  describe('handleGetLogs', () => {
    it(`should be called when command of message is "${MOCK.LOG_COMMAND_SENT_TO_SERVER.payload.command}"`, () => {
      const spy = spyOn(service as any, 'handleGetLogs');
      (service as any).handleMessage(JSON.stringify(wsMessage));
      expect(spy).toHaveBeenCalled();
    });

    it('should not be called when received data is empty', () => {
      const spy = spyOn(service as any, 'handleGetLogs');
      (service as any).handleMessage(JSON.stringify({}));
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('handleGetTestcellComponents', () => {
    it(`should be called when command of message is "${MOCK.GET_TEST_CELL_COMPONENTS_COMMAND.payload.command}"`, () => {
      const spy = spyOn(service as any, 'handleGetTestcellComponents');
      (service as any).handleMessage(JSON.stringify(MOCK.GET_TEST_CELL_COMPONENTS_COMMAND));
      expect(spy).toHaveBeenCalled();
    });

    it('should not be called when received data is empty', () => {
      const spy = spyOn(service as any, 'handleGetTestcellComponents');
      (service as any).handleMessage(JSON.stringify({}));
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('handleLoadLot', () => {
    it(`should be called when command of message is "${MOCK.LOAD_LOT_COMMAND_SENT_TO_SERVER.payload.command}"`, () => {
      const spy = spyOn(service as any, 'handleLoadLot');
      (service as any).handleMessage(JSON.stringify(MOCK.LOAD_LOT_COMMAND_SENT_TO_SERVER));
      expect(spy).toHaveBeenCalled();
    });

    it('should call "sendMessage"', () => {
      const spy = spyOn(service as any, 'sendMessage');
      (service as any).handleLoadLot();
      expect(spy).toHaveBeenCalledWith([MOCK.SUPERVISOR_STATE_BUSY, MOCK.CAMADAPTOR_STATE_BUSY, MOCK.MSCTADAPTOR_STATE_BUSY]);
    });
  });

  describe('handleUnloadLot', () => {
    it(`should be called when command of message is "${MOCK.UNLOAD_LOT_COMMAND_SENT_TO_SERVER.payload.command}"`, () => {
      const spy = spyOn(service as any, 'handleUnloadLot');
      (service as any).handleMessage(JSON.stringify(MOCK.UNLOAD_LOT_COMMAND_SENT_TO_SERVER));
      expect(spy).toHaveBeenCalled();
    });

    it('should call "sendMessage"', () => {
      const spy = spyOn(service as any, 'sendMessage');
      (service as any).handleUnloadLot();
      expect(spy).toHaveBeenCalledWith([MOCK.SUPERVISOR_STATE_READY, MOCK.CAMADAPTOR__STATE_READY, MOCK.MSCTADAPTOR__STATE_READY]);
    });
  });

  it('should send messages when "sendMessage" called', () => {
    (service as any).socket = websocketService;

    const messages = [MOCK.SUPERVISOR_STATE_READY];
    const spy = spyOn((service as any).socket, 'send');

    (service as any).sendMessage(messages);
    expect(spy).toHaveBeenCalledWith(JSON.stringify(MOCK.SUPERVISOR_STATE_READY));
  });
});
