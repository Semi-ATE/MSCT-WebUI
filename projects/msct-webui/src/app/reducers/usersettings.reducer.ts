import { UserSettings, TestOptionSetting, TestOptionType, LogLevel } from './../models/usersettings.model';
import * as UserSettingsActions from './../actions/usersettings.actions';
import { on, Action, createReducer } from '@ngrx/store';

const computeInitialState = (): UserSettings => {
  const settings: UserSettings = {
    testOptions: [],
    logLevel: LogLevel.Warning,
  };
  Object.keys(TestOptionType).forEach(e => {
    settings.testOptions.push(
      {
        type: e,
        value: {
          active: false,
          value: -1
        }
      } as TestOptionSetting);
  });
  return  settings;
};

// define the initial state here
const initialState = computeInitialState();

const reducer = createReducer(
  initialState,
  on(UserSettingsActions.setSettings, (_state, settings) => settings)
);

export function userSettingsReducer(state: UserSettings | undefined, action: Action): UserSettings {
  return reducer(state, action);
}
