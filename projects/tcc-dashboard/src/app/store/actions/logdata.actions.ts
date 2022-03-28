import { createAction, props } from '@ngrx/store';
import { TccLogs } from '../models/store.models';

const ADD_LOGDATA = '[LOGDATA] Add';

export const addLogData = createAction(ADD_LOGDATA, props<{logData: TccLogs}>());
