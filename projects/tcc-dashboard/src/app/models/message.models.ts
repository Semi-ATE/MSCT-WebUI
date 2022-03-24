import { ElementState } from './element-status.models';

export enum Topic {
  TopicForLogging = 'ws/log',
  TopicForTestcellComponent = 'ws/testcellcomponents',
  TopicForSupervisor = 'TCC/tcc01/Supervisor/command'
}

export enum Command {
  GetLogs = 'GetLogs',
  GetTestcellComponents = 'GetTestcellComponents',
  LoadJob = 'LoadJob',
  UnloadJob = 'UnloadJob',
  ReloadJob = 'ReloadJob'
}

export interface WebsocketMessage {
  topic: string;
  payload: PayloadData;
}

export interface PayloadData {
  command: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}

export interface LoggingMessage {
  topic: string;
  payload: LogData;
}

export interface LogData {
  entries: Array<string>;
}

export interface TestCellMessage {
  topic: string;
  payload: TestCellComponents;
}

export interface TestCellComponents {
  components: Array<ElementState>;
}
