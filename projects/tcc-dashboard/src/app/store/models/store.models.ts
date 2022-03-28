import { createFeatureSelector } from '@ngrx/store';
import { ElementState } from '../../models/element-status.models';
import { LogDataEntry } from '../../models/logdata.models';

export type TccComponents = Array<ElementState>;
export type TccLogs = Array<LogDataEntry>;

export const featureLogsKey = 'logs';

export interface LogFeatureState {
  logs: TccLogs;
}

export const featureCommponentsKey = 'components';

export interface ComponentFeatureState {
  components: TccComponents;
}

export interface TccState {
  logs: LogFeatureState;
  components: ComponentFeatureState ;
}

export const selectFeatureLogs = createFeatureSelector<TccState, LogFeatureState>(featureLogsKey);
export const selectFeatureComponents = createFeatureSelector<TccState, ComponentFeatureState>(featureCommponentsKey);
