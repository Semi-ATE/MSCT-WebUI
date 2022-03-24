import * as TccComponentsActions from '../actions/components.actions';
import { TccComponents } from '../models/store.models';
import { createReducer, on, Action } from '@ngrx/store';

const initialState: TccComponents = [];

const reducer = createReducer(
  initialState,
  on(TccComponentsActions.updateComponents, (state, { components }) => {
    const result = [...state];

    components.forEach(e => {
      const foundIndex = result.findIndex(r => r.component === e.component);
      (foundIndex >= 0) ? (result[foundIndex] = e) : result.push(e);
    });

    return result;
  })
);

export function tccComponentsReducer(state: TccComponents | undefined, action: Action): TccComponents {
  return reducer(state, action);
}
