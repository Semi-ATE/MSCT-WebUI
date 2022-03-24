export enum Status {
  starting = 'Starting',
  ready = 'Empty',
  preloading = 'Preloading',
  preloadDone = 'PreloadDone',
  loadingjob = 'LoadingJob',
  busy = 'Loaded',
  unloadingJob = 'UnloadingJob',
  postprocessing = 'Postprocessing',
  reloading = 'Reloading',
  error = 'Error',
  crash = 'Crash',
  unknown = ''
}

export interface Notice {
  type?: string;
  message: string;
  priority: number;
  id?: string;
}

export interface ElementState {
  component: string;
  state: Status;
  message?: string;
  notices: Array<Notice>;
}
