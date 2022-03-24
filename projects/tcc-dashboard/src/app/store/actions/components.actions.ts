import { createAction, props } from '@ngrx/store';
import { TccComponents } from '../models/store.models';

const UPDATE_COMPONENTS = '[COMPONENTS] Update';

export const updateComponents = createAction(UPDATE_COMPONENTS, props<{components: TccComponents}>());
