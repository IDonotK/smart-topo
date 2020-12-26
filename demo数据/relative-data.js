export const getA1Up = () => {
  return {
    data: {
      applications: [
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
      ],
      middleWares: [],
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
      ],
    },
  };
};

export const getA1Down = () => {
  return {
    data: {
      applications: [
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
          id: 'a28',
          name: 'a28',
          createTime: '2020-12-01T07:01:02.000+00:00',
          updateTime: '2020-12-01T08:16:16.000+00:00',
          label: 'Application',
          eventCount: 0,
        },
      ],
      middleWares: [],
      subTracingTos: [
        {
          id: 't4',
          name: 't4',
          source: 'a1',
          target: 'a28',
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
      ],
    },
  };
};

export const getA1Cl = () => {
  return {
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
      ],
      middleWares: [],
      processes: [
        {
          id: 'ps1',
          name: 'ps1',
          createTime: '2020-12-01T07:06:57.000+00:00',
          updateTime: '2020-12-01T07:07:04.000+00:00',
          label: 'Process',
          eventCount: 0,
          hostName: 'SZA2005135573-B',
          processNo: '3784',
        },
        {
          id: 'ps2',
          name: 'ps2',
          createTime: '2020-12-01T07:06:57.000+00:00',
          updateTime: '2020-12-01T07:07:04.000+00:00',
          label: 'Process',
          eventCount: 0,
          hostName: 'SZA2005135573-B',
          processNo: '3784',
        },
      ],
      workloads: [
        {
          id: 'w1',
          name: 'w1',
          createTime: '2020-12-01T06:44:37.000+00:00',
          updateTime: '2020-12-01T08:05:00.000+00:00',
          label: 'Workload',
          eventCount: 0,
          kind: 'Deployment',
        },
        {
          id: 'w2',
          name: 'w2',
          createTime: '2020-12-01T06:44:37.000+00:00',
          updateTime: '2020-12-01T08:05:00.000+00:00',
          label: 'Workload',
          eventCount: 0,
          kind: 'Deployment',
        },
      ],
      pods: [
        {
          id: 'pd1',
          name: 'pd1',
          createTime: '2020-12-01T07:06:56.000+00:00',
          updateTime: '2020-12-01T07:06:55.000+00:00',
          label: 'Pod',
          eventCount: 0,
          podIp: '127.0.0.1',
        },
        {
          id: 'pd2',
          name: 'pd2',
          createTime: '2020-12-01T07:06:56.000+00:00',
          updateTime: '2020-12-01T07:06:55.000+00:00',
          label: 'Pod',
          eventCount: 0,
          podIp: '127.0.0.1',
        },
      ],
      nodes: [
        {
          id: 'n1',
          name: 'n1',
          createTime: '2020-09-09T05:56:46.000+00:00',
          updateTime: '2020-11-25T09:37:32.000+00:00',
          label: 'Node',
          event_count: 0,
          node_ip: '125.1.0.2',
        },
        {
          id: 'n2',
          name: 'n2',
          createTime: '2020-09-09T05:56:46.000+00:00',
          updateTime: '2020-11-25T09:37:32.000+00:00',
          label: 'Node',
          event_count: 0,
          node_ip: '125.1.0.2',
        },
      ],
      tracingTos: [],
      createOns: [
        {
          id: 'c1',
          name: 'c1',
          label: 'CreateOn',
          source: 'a1',
          target: 'ps1',
        },
        {
          id: 'c2',
          name: 'c2',
          label: 'CreateOn',
          source: 'ps1',
          target: 'w1',
        },
        {
          id: 'c3',
          name: 'c3',
          label: 'CreateOn',
          source: 'w1',
          target: 'pd1',
        },
        {
          id: 'c4',
          name: 'c4',
          label: 'CreateOn',
          source: 'pd1',
          target: 'n1',
        },
        {
          id: 'c5',
          name: 'c5',
          label: 'CreateOn',
          source: 'a1',
          target: 'n1',
        },
        {
          id: 'c6',
          name: 'c6',
          label: 'CreateOn',
          source: 'ps1',
          target: 'pd1',
        },

        {
          id: 'c37',
          name: 'c37',
          label: 'CreateOn',
          source: 'a1',
          target: 'w1',
        },
        {
          id: 'c38',
          name: 'c38',
          label: 'CreateOn',
          source: 'a1',
          target: 'pd1',
        },
        {
          id: 'c39',
          name: 'c39',
          label: 'CreateOn',
          source: 'ps1',
          target: 'n1',
        },
        {
          id: 'c40',
          name: 'c40',
          label: 'CreateOn',
          source: 'w1',
          target: 'n1',
        },
         {
          id: 'c41',
          name: 'c41',
          label: 'CreateOn',
          source: 'a1',
          target: 'ps2',
        },
        {
          id: 'c42',
          name: 'c42',
          label: 'CreateOn',
          source: 'ps2',
          target: 'w2',
        },
        {
          id: 'c43',
          name: 'c43',
          label: 'CreateOn',
          source: 'ps2',
          target: 'pd2',
        },
        {
          id: 'c44',
          name: 'c44',
          label: 'CreateOn',
          source: 'ps2',
          target: 'n2',
        },
        {
          id: 'c45',
          name: 'c45',
          label: 'CreateOn',
          source: 'w2',
          target: 'pd2',
        },
        {
          id: 'c46',
          name: 'c46',
          label: 'CreateOn',
          source: 'w2',
          target: 'n2',
        },
        {
          id: 'c47',
          name: 'c47',
          label: 'CreateOn',
          source: 'pd2',
          target: 'n2',
        },
      ],
    },
  };
};

export const PS2_UP = {
  data: {
    applications: [],
    middleWares: [],
    subTracingTos: [],
  },
};

export const PS2_DOWN = {
  data: {
    applications: [],
    middleWares: [],
    subTracingTos: [],
  },
};

export const PS2_CL = {
  data: {
    applications: [
      {
        id: 'a8',
        name: 'a8',
        createTime: '2020-12-01T07:01:02.000+00:00',
        updateTime: '2020-12-01T08:16:16.000+00:00',
        label: 'Application',
        eventCount: 0,
      },
      {
        id: 'a9',
        name: 'a9',
        createTime: '2020-12-01T07:01:02.000+00:00',
        updateTime: '2020-12-01T08:16:16.000+00:00',
        label: 'Application',
        eventCount: 5,
      },
      {
        id: 'a10',
        name: 'a10',
        createTime: '2020-12-01T07:01:02.000+00:00',
        updateTime: '2020-12-01T08:16:16.000+00:00',
        label: 'Application',
        eventCount: 0,
      },
      {
        id: 'a11',
        name: 'a11',
        createTime: '2020-12-01T07:01:02.000+00:00',
        updateTime: '2020-12-01T08:16:16.000+00:00',
        label: 'Application',
        eventCount: 0,
      },
    ],
    middleWares: [
      {
        id: 'm2',
        name: 'm2',
        createTime: '2020-12-01T07:01:02.000+00:00',
        updateTime: '2020-12-01T08:16:16.000+00:00',
        label: 'MiddleWare',
        eventCount: 0,
        middleWareType: 'MQ',
      },
      {
        id: 'm3',
        name: 'm3',
        createTime: '2020-12-01T07:01:02.000+00:00',
        updateTime: '2020-12-01T08:16:16.000+00:00',
        label: 'MiddleWare',
        eventCount: 0,
        middleWareType: 'MQ',
      },
    ],
    processes: [
      {
        id: 'ps2',
        name: 'ps2',
        createTime: '2020-12-01T07:06:57.000+00:00',
        updateTime: '2020-12-01T07:07:04.000+00:00',
        label: 'Process',
        eventCount: 0,
        hostName: 'SZA2005135573-B',
        processNo: '3784',
      },
    ],
    workloads: [
      {
        id: 'w2',
        name: 'w2',
        createTime: '2020-12-01T06:44:37.000+00:00',
        updateTime: '2020-12-01T08:05:00.000+00:00',
        label: 'Workload',
        eventCount: 0,
        kind: 'Deployment',
      },
    ],
    pods: [
      {
        id: 'pd1',
        name: 'pd1',
        createTime: '2020-12-01T07:06:56.000+00:00',
        updateTime: '2020-12-01T07:06:55.000+00:00',
        label: 'Pod',
        eventCount: 0,
        podIp: '127.0.0.1',
      },
      {
        id: 'pd2',
        name: 'pd2',
        createTime: '2020-12-01T07:06:56.000+00:00',
        updateTime: '2020-12-01T07:06:55.000+00:00',
        label: 'Pod',
        eventCount: 0,
        podIp: '127.0.0.1',
      },
    ],
    nodes: [
      {
        id: 'n1',
        name: 'n1',
        createTime: '2020-09-09T05:56:46.000+00:00',
        updateTime: '2020-11-25T09:37:32.000+00:00',
        label: 'Node',
        event_count: 0,
        node_ip: '125.1.0.2',
      },
      {
        id: 'n2',
        name: 'n2',
        createTime: '2020-09-09T05:56:46.000+00:00',
        updateTime: '2020-11-25T09:37:32.000+00:00',
        label: 'Node',
        event_count: 0,
        node_ip: '125.1.0.2',
      },
    ],
    tracingTos: [],
    createOns: [
      {
        id: 'c8',
        name: 'c8',
        label: 'CreateOn',
        source: 'm2',
        target: 'ps2',
      },
      {
        id: 'c9',
        name: 'c9',
        label: 'CreateOn',
        source: 'm3',
        target: 'ps2',
      },
      {
        id: 'c10',
        name: 'c10',
        label: 'CreateOn',
        source: 'a8',
        target: 'ps2',
      },
      {
        id: 'c11',
        name: 'c11',
        label: 'CreateOn',
        source: 'a9',
        target: 'ps2',
      },
      {
        id: 'c12',
        name: 'c12',
        label: 'CreateOn',
        source: 'a10',
        target: 'ps2',
      },
      {
        id: 'c13',
        name: 'c13',
        label: 'CreateOn',
        source: 'a11',
        target: 'ps2',
      },
      {
        id: 'c4',
        name: 'c4',
        label: 'CreateOn',
        source: 'ps2',
        target: 'w2',
      },
      {
        id: 'c6',
        name: 'c6',
        label: 'CreateOn',
        source: 'w2',
        target: 'pd1',
      },
      {
        id: 'c7',
        name: 'c7',
        label: 'CreateOn',
        source: 'pd1',
        target: 'n1',
      },
      {
        id: 'c14',
        name: 'c14',
        label: 'CreateOn',
        source: 'w2',
        target: 'pd2',
      },
      {
        id: 'c15',
        name: 'c15',
        label: 'CreateOn',
        source: 'pd2',
        target: 'n2',
      },
    ],
  },
};
