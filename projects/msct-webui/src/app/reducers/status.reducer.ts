import { Status, SystemState } from './../models/status.model';
import * as StatusActions from './../actions/status.actions';
import { Action, createReducer, on } from '@ngrx/store';

// define the initial state here
const initialState: Status = {
  deviceId: 'connecting',
  env: 'connecting',
  handler: 'connecting',
  time: 'connecting',
  sites: new Array<string>(),
  program: '',
  log: '',
  state: SystemState.connecting,
  reason: '',
  lotNumber: ''
};

const reducer = createReducer(
  initialState,
  on(StatusActions.updateStatus, (_state, {status}) => status)
);

export function statusReducer(state: Status | undefined, action: Action): Status {
  return reducer(state, action);
}
