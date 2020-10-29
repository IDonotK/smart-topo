const LOCAL_STATE_TOPO = {
  nodes: [
    {
      id: 'app1',
      name: 'app1',
      type: 'App'
    },
    {
      id: 'app2',
      name: 'app2',
      type: 'App'
    },
    {
      id: 'process1',
      name: 'process1',
      type: 'Process'
    },
    {
      id: 'process2',
      name: 'process2',
      type: 'Process'
    },
    {
      id: 'process3',
      name: 'process3',
      type: 'Process'
    },
    {
      id: 'process4',
      name: 'process4',
      type: 'Process'
    },
    {
      id: 'pod1',
      name: 'pod1',
      type: 'Pod'
    },
    {
      id: 'pod2',
      name: 'pod2',
      type: 'Pod'
    },
    {
      id: 'node1',
      name: 'node1',
      type: 'Node'
    },
    {
      id: 'node2',
      name: 'node2',
      type: 'Node'
    }
  ],
  calls: [
    {
      source: {
        id: 'app1',
        name: 'app1',
        type: 'App'
      },
      target: {
        id: 'app2',
        name: 'app2',
        type: 'App'
      },
      type: 'tracingto'
    },
    {
      source: {
        id: 'app1',
        name: 'app1',
        type: 'App'
      },
      target: {
        id: 'process1',
        name: 'process1',
        type: 'Process'
      },
      type: 'createon'
    },
    {
      source: {
        id: 'app1',
        name: 'app1',
        type: 'App'
      },
      target: {
        id: 'process2',
        name: 'process2',
        type: 'Process'
      },
      type: 'createon'
    },
    {
      source: {
        id: 'process1',
        name: 'process1',
        type: 'Process'
      },
      target: {
        id: 'pod1',
        name: 'pod1',
        type: 'Pod'
      },
      type: 'createon'
    },
    {
      source: {
        id: 'process2',
        name: 'process2',
        type: 'Process'
      },
      target: {
        id: 'pod1',
        name: 'pod1',
        type: 'Pod'
      },
      type: 'createon'
    },
    {
      source: {
        id: 'pod1',
        name: 'pod1',
        type: 'Pod'
      },
      target: {
        id: 'node1',
        name: 'node1',
        type: 'Node'
      },
      type: 'createon'
    },
    {
      source: {
        id: 'app2',
        name: 'app2',
        type: 'App'
      },
      target: {
        id: 'process3',
        name: 'process3',
        type: 'Process'
      },
      type: 'createon'
    },
    {
      source: {
        id: 'app2',
        name: 'app2',
        type: 'App'
      },
      target: {
        id: 'process4',
        name: 'process4',
        type: 'Process'
      },
      type: 'createon'
    },
    {
      source: {
        id: 'process3',
        name: 'process3',
        type: 'Process'
      },
      target: {
        id: 'pod2',
        name: 'pod2',
        type: 'Pod'
      },
      type: 'createon'
    },
    {
      source: {
        id: 'process4',
        name: 'process4',
        type: 'Process'
      },
      target: {
        id: 'pod2',
        name: 'pod2',
        type: 'Pod'
      },
      type: 'createon'
    },
    {
      source: {
        id: 'pod2',
        name: 'pod2',
        type: 'Pod'
      },
      target: {
        id: 'node2',
        name: 'node2',
        type: 'Node'
      },
      type: 'createon'
    }
  ]
};

export default LOCAL_STATE_TOPO;