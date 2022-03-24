import * as LogDataActions from '../actions/logdata.actions';
import { TccLogs } from '../models/store.models';
import { createReducer, on, Action } from '@ngrx/store';

const initialState: TccLogs = [];
const MAX_LOG_ENTRIES = 2000;

const reducer = createReducer(
  initialState,
  on(LogDataActions.addLogData, (state, { logData }) => {
    if (logData.length >= MAX_LOG_ENTRIES) {
      // It should always show the last 100 entries
      return logData.slice(100, MAX_LOG_ENTRIES).concat(logData.slice(-100));
    } else if (logData.length + state.length > MAX_LOG_ENTRIES) {
      return [...logData].concat(state.slice(0, MAX_LOG_ENTRIES - logData.length));
    } else {
      return [...logData,...state];
    }
  })
);

export function logDataReducer(state: TccLogs | undefined, action: Action): TccLogs {
  return reducer(state, action);
}
