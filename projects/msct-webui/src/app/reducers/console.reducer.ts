import { ConsoleEntry } from './../models/console.model';
import * as ConsoleActions from './../actions/console.actions';
import { createReducer, on, Action } from '@ngrx/store';

export const initialState = new Array<ConsoleEntry>();

const MAX_CONSOLE_ENTRIES = 4000;

const reducer = createReducer(
  initialState,
  on(ConsoleActions.addConsoleEntry, (state: Array<ConsoleEntry>, {entries}) => {
      if (entries.length >= MAX_CONSOLE_ENTRIES) {
        return entries.slice(0, MAX_CONSOLE_ENTRIES);
      } else if (entries.length + state.length > MAX_CONSOLE_ENTRIES) {
        return [...entries].concat(state.slice(0, MAX_CONSOLE_ENTRIES - entries.length));
      } else {
        return [...entries, ...state];
      }
    }),
  on(ConsoleActions.clearConsoleEntries, _state => [])
);

export function consoleReducer(state: ConsoleEntry[] | undefined, action: Action): Array<ConsoleEntry> {
  return reducer(state, action);
}
