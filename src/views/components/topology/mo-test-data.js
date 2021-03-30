/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
export const getA1Both = () => ({
  data: {
    applications: [
      {
        id: 'a1',
        name: 'a1',
        createTime: '2020-12-01T07:01:02.000+00:00',
        updateTime: '2020-12-01T08:16:16.000+00:00',
        label: 'Application',
        eventCount: 1,
      },
      {
        id: 'a2',
        name: 'a2',
        createTime: '2020-12-01T07:01:02.000+00:00',
        updateTime: '2020-12-01T08:16:16.000+00:00',
        label: 'Application',
        eventCount: 0,
      },
      {
        id: 'a3',
        name: 'a3',
        createTime: '2020-12-01T07:01:02.000+00:00',
        updateTime: '2020-12-01T08:16:16.000+00:00',
        label: 'Application',
        eventCount: 2,
      },
      {
        id: 'a4',
        name: 'a4',
        createTime: '2020-12-01T07:01:02.000+00:00',
        updateTime: '2020-12-01T08:16:16.000+00:00',
        label: 'Application',
        eventCount: 0,
      },
      {
        id: 'a5',
        name: 'a5',
        createTime: '2020-12-01T07:01:02.000+00:00',
        updateTime: '2020-12-01T08:16:16.000+00:00',
        label: 'Application',
        eventCount: 3,
      },
      {
        id: 'a6',
        name: 'a6',
        createTime: '2020-12-01T07:01:02.000+00:00',
        updateTime: '2020-12-01T08:16:16.000+00:00',
        label: 'Application',
        eventCount: 0,
      },
      {
        id: 'a7',
        name: 'a7',
        createTime: '2020-12-01T07:01:02.000+00:00',
        updateTime: '2020-12-01T08:16:16.000+00:00',
        label: 'Application',
        eventCount: 4,
      },
      {
        id: 'a8',
        name: 'a8',
        createTime: '2020-12-01T07:01:02.000+00:00',
        updateTime: '2020-12-01T08:16:16.000+00:00',
        label: 'Application',
        eventCount: 4,
      },
    ],
    middleWares: [
      {
        id: 'm1',
        name: 'm1',
        createTime: '2020-12-01T07:01:02.000+00:00',
        updateTime: '2020-12-01T08:16:16.000+00:00',
        label: 'MiddleWare',
        eventCount: 0,
        middleWareType: 'Database',
      },
    ],
    subTracingTos: [
      {
        id: 't1',
        name: 't1',
        source: 'a3',
        target: 'a2',
        label: 'SubTracingTo',
        responseTimePerMin: 1,
        callPerMinute: 120,
        type: 'kafka-producer',
      },
      {
        id: 't2',
        name: 't2',
        source: 'a2',
        target: 'a1',
        label: 'SubTracingTo',
        responseTimePerMin: 2,
        callPerMinute: 121,
        type: 'kafka-producer',
      },
      {
        id: 't3',
        name: 't3',
        source: 'a4',
        target: 'a1',
        label: 'SubTracingTo',
        responseTimePerMin: 3,
        callPerMinute: 122,
        type: 'kafka-producer',
      },
      {
        id: 't4',
        name: 't4',
        source: 'a1',
        target: 'm1',
        label: 'SubTracingTo',
        responseTimePerMin: 4,
        callPerMinute: 123,
        type: 'kafka-producer',
      },
      {
        id: 't5',
        name: 't5',
        source: 'a1',
        target: 'a5',
        label: 'SubTracingTo',
        responseTimePerMin: 5,
        callPerMinute: 124,
        type: 'kafka-producer',
      },
      {
        id: 't6',
        name: 't6',
        source: 'a5',
        target: 'a6',
        label: 'SubTracingTo',
        responseTimePerMin: 6,
        callPerMinute: 125,
        type: 'kafka-producer',
      },
      {
        id: 't7',
        name: 't7',
        source: 'a6',
        target: 'a7',
        label: 'SubTracingTo',
        responseTimePerMin: 7,
        callPerMinute: 126,
        type: 'kafka-producer',
      },
      {
        id: 't8',
        name: 't8',
        source: 'a3',
        target: 'a1',
        label: 'SubTracingTo',
        responseTimePerMin: 7,
        callPerMinute: 126,
        type: 'kafka-producer',
      },
      // {
      //   id: 't9',
      //   name: 't9',
      //   source: 'a7',
      //   target: 'a5',
      //   label: 'SubTracingTo',
      //   responseTimePerMin: 7,
      //   callPerMinute: 126,
      //   type: 'kafka-producer',
      // },
      {
        id: 't10',
        name: 't10',
        source: 'a1',
        target: 'a7',
        label: 'SubTracingTo',
        responseTimePerMin: 7,
        callPerMinute: 126,
        type: 'kafka-producer',
      },
      {
        id: 't11',
        name: 't11',
        source: 'a1',
        target: 'a6',
        label: 'SubTracingTo',
        responseTimePerMin: 7,
        callPerMinute: 126,
        type: 'kafka-producer',
      },
      {
        id: 't12',
        name: 't12',
        source: 'a6',
        target: 'a8',
        label: 'SubTracingTo',
        responseTimePerMin: 7,
        callPerMinute: 126,
        type: 'kafka-producer',
      },
      {
        id: 't13',
        name: 't13',
        source: 'a7',
        target: 'a8',
        label: 'SubTracingTo',
        responseTimePerMin: 7,
        callPerMinute: 126,
        type: 'kafka-producer',
      },
    ],
    eventInfos: {
      a1: {
        eventCount: 10,
        eventLevel: 'Critical',
      },
      a5: {
        eventCount: 10,
        eventLevel: 'Critical',
      },
      a2: {
        eventCount: 0,
        eventLevel: 'Critical',
      },
      m1: {
        eventCount: 8,
        eventLevel: 'Warning',
      },
    },
  },
});