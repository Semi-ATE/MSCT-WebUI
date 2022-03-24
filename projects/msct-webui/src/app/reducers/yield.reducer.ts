import { Action, createReducer, on } from '@ngrx/store';
import { YieldData } from '../models/yield.model';
import * as YieldActions from './../actions/yield.actions';

export const initialYieldData: YieldData = [];

const reducer = createReducer(
  initialYieldData,
  on(YieldActions.updateYield, (_state, {yieldData}) => yieldData)
);

export function yieldReducer(state: YieldData | undefined, action: Action): YieldData {
  return reducer(state, action);
}
