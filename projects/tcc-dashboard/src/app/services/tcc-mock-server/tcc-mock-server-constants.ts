import { Status } from '../../models/element-status.models';
import { Command, Topic } from '../../models/message.models';

export const LOG_COMMAND_SENT_TO_SERVER = {
  topic: Topic.TopicForSupervisor,
  payload: {
    command: Command.GetLogs,
    payload: {}
  }
};

export const LOG_ENTRIES = {
  topic: Topic.TopicForLogging,
  payload: {
    entries: [
      'INFO | 2021-04-27 17:44:43,348 | tccsupervisor.testcellimpl.testcellimpl | Switch state to Starting',
      'INFO | 2021-04-27 17:44:43,582 | tccsupervisor.testcellimpl.testcellimpl | Switch state to Ready',
      'INFO | 2021-05-25 12:35:01,497 | TCC.tcc01.basic.CamAdaptor.basicadaptor.basicadaptor | Status message received: TCC/tcc01/Supervisor/status  :  {"status": "Ready", "message": ""}'
    ]
  }
};

export const GET_TEST_CELL_COMPONENTS_COMMAND = {
  topic: Topic.TopicForSupervisor,
  payload: {
    command: Command.GetTestcellComponents,
    payload: {}
  }
};

export const TESTCELL_COMPONENTS_ENTRIES = {
  topic: Topic.TopicForTestcellComponent,
  payload: {
    components: [
      {
        component: 'Supervisor(tcc01)',
        state: Status.ready,
        notices: [
          {
            type: 'set',
            message: 'Supervisor Empty',
            priority: 10,
            id: 'supervisor_empty'
          }
        ]
      },
      {
        component: 'CamAdaptor',
        state: Status.ready,
        notices: [
          {
            type: 'set',
            message: 'CamAdaptor Empty',
            priority: 10,
            id: 'camadaptor_empty'
          }
        ]
      },
      {
        component: 'MSCT Adaptor Debug',
        state: Status.ready,
        notices: [
          {
            type: 'set',
            message: 'MSCT Master Empty',
            priority: 10,
            id: 'msct_empty'
          },
          {
            type: 'set',
            message: 'MSCT Master Waiting',
            priority: 9,
            id: 'msct_waiting'
          }
        ]
      }
    ]
  }
};

export const SUPERVISOR_STATE_BUSY = {
  topic: Topic.TopicForTestcellComponent,
  payload: {
    components: [
      {
        component: 'Supervisor(tcc01)',
        state: Status.busy,
        notices: [
          {
            type: 'set',
            message: 'Supervisor Loaded',
            priority: 9,
            id: 'supervisor_loaded'
          }
        ]
      }
    ]
  }
};

export const CAMADAPTOR_STATE_BUSY = {
  topic: Topic.TopicForTestcellComponent,
  payload: {
    components: [
      {
        component: 'CamAdaptor',
        state: Status.busy,
        notices: [
          {
            type: 'set',
            message: 'CamAdaptor Loaded',
            priority: 9,
            id: 'camadaptor_loaded'
          }
        ]
      }
    ]
  }
};

export const MSCTADAPTOR_STATE_BUSY = {
  topic: Topic.TopicForTestcellComponent,
  payload: {
    components: [
      {
        component: 'MSCT Adaptor Debug',
        state: Status.busy,
        notices: [
          {
            type: 'set',
            message: 'MSCT Master Loaded',
            priority: 9,
            id: 'msct_loaded'
          }
        ]
      }
    ]
  }
};

export const LOAD_LOT_COMMAND_SENT_TO_SERVER = {
  topic: Topic.TopicForSupervisor,
  payload: {
    command: Command.LoadJob,
    payload: {
      job_name: '123456.000'
    }
  }
};

export const UNLOAD_LOT_COMMAND_SENT_TO_SERVER = {
  topic: Topic.TopicForSupervisor,
  payload: {
    command: Command.UnloadJob,
    payload: {}
  }
};

export const SUPERVISOR_STATE_READY = {
  topic: Topic.TopicForTestcellComponent,
  payload: {
    components: [
      {
        component: 'Supervisor(tcc01)',
        state: Status.ready,
        notices: [
          {
            type: 'set',
            message: 'Supervisor Empty',
            priority: 10,
            id: 'supervisor_empty'
          }
        ]
      }
    ]
  }
};

export const CAMADAPTOR__STATE_READY = {
  topic: Topic.TopicForTestcellComponent,
  payload: {
    components: [
      {
        component: 'CamAdaptor',
        state: Status.ready,
        notices: [
          {
            type: 'set',
            message: 'CamAdaptor empty',
            priority: 10,
            id: 'camadaptor_empty'
          }
        ]
      },
    ]
  }
};

export const MSCTADAPTOR__STATE_READY = {
  topic: Topic.TopicForTestcellComponent,
  payload: {
    components: [
      {
        component: 'MSCT Adaptor Debug',
        state: Status.ready,
        notices: [
          {
            type: 'set',
            message: 'MSCT Master Empty',
            priority: 10,
            id: 'msct_empty'
          }
        ]
      }
    ]
  }
};


