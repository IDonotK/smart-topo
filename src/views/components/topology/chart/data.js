// const LOCAL_STATE_TOPO = {
//   nodes: [
//     {
//       id: 'app1',
//       name: 'app1',
//       type: 'Application'
//     },
//     {
//       id: 'app2',
//       name: 'app2',
//       type: 'Application'
//     },
//     {
//       id: 'process1',
//       name: 'process1',
//       type: 'Process'
//     },
//     {
//       id: 'process2',
//       name: 'process2',
//       type: 'Process'
//     },
//     {
//       id: 'process3',
//       name: 'process3',
//       type: 'Process'
//     },
//     {
//       id: 'process4',
//       name: 'process4',
//       type: 'Process'
//     },
//     {
//       id: 'pod1',
//       name: 'pod1',
//       type: 'Pod'
//     },
//     {
//       id: 'pod2',
//       name: 'pod2',
//       type: 'Pod'
//     },
//     {
//       id: 'node1',
//       name: 'node1',
//       type: 'Node'
//     },
//     {
//       id: 'node2',
//       name: 'node2',
//       type: 'Node'
//     }
//   ],
//   calls: [
//     {
//       source: {
//         id: 'app1',
//         name: 'app1',
//         type: 'Application'
//       },
//       target: {
//         id: 'app2',
//         name: 'app2',
//         type: 'Application'
//       },
//       type: 'TracingTo'
//     },
//     {
//       source: {
//         id: 'app1',
//         name: 'app1',
//         type: 'Application'
//       },
//       target: {
//         id: 'process1',
//         name: 'process1',
//         type: 'Process'
//       },
//       type: 'CreateOn'
//     },
//     {
//       source: {
//         id: 'app1',
//         name: 'app1',
//         type: 'Application'
//       },
//       target: {
//         id: 'process2',
//         name: 'process2',
//         type: 'Process'
//       },
//       type: 'CreateOn'
//     },
//     {
//       source: {
//         id: 'process1',
//         name: 'process1',
//         type: 'Process'
//       },
//       target: {
//         id: 'pod1',
//         name: 'pod1',
//         type: 'Pod'
//       },
//       type: 'CreateOn'
//     },
//     {
//       source: {
//         id: 'process2',
//         name: 'process2',
//         type: 'Process'
//       },
//       target: {
//         id: 'pod1',
//         name: 'pod1',
//         type: 'Pod'
//       },
//       type: 'CreateOn'
//     },
//     {
//       source: {
//         id: 'pod1',
//         name: 'pod1',
//         type: 'Pod'
//       },
//       target: {
//         id: 'node1',
//         name: 'node1',
//         type: 'Node'
//       },
//       type: 'CreateOn'
//     },
//     {
//       source: {
//         id: 'app2',
//         name: 'app2',
//         type: 'Application'
//       },
//       target: {
//         id: 'process3',
//         name: 'process3',
//         type: 'Process'
//       },
//       type: 'CreateOn'
//     },
//     {
//       source: {
//         id: 'app2',
//         name: 'app2',
//         type: 'Application'
//       },
//       target: {
//         id: 'process4',
//         name: 'process4',
//         type: 'Process'
//       },
//       type: 'CreateOn'
//     },
//     {
//       source: {
//         id: 'process3',
//         name: 'process3',
//         type: 'Process'
//       },
//       target: {
//         id: 'pod2',
//         name: 'pod2',
//         type: 'Pod'
//       },
//       type: 'CreateOn'
//     },
//     {
//       source: {
//         id: 'process4',
//         name: 'process4',
//         type: 'Process'
//       },
//       target: {
//         id: 'pod2',
//         name: 'pod2',
//         type: 'Pod'
//       },
//       type: 'CreateOn'
//     },
//     {
//       source: {
//         id: 'pod2',
//         name: 'pod2',
//         type: 'Pod'
//       },
//       target: {
//         id: 'node2',
//         name: 'node2',
//         type: 'Node'
//       },
//       type: 'CreateOn'
//     }
//   ]
// };

const LOCAL_STATE_TOPO = {
  nodes: [
    {
      id: 'app1',
      name: 'app1',
      type: 'Application',
    },
    {
      id: 'app2',
      name: 'app2',
      type: 'Application',
    },
    {
      id: 'process1',
      name: 'process1',
      type: 'Process',
    },
    {
      id: 'process2',
      name: 'process2',
      type: 'Process',
    },
    {
      id: 'process3',
      name: 'process3',
      type: 'Process',
    },
    {
      id: 'process4',
      name: 'process4',
      type: 'Process',
    },
    {
      id: 'pod1',
      name: 'pod1',
      type: 'Pod',
    },
    {
      id: 'pod2',
      name: 'pod2',
      type: 'Pod',
    },
    {
      id: 'node1',
      name: 'node1',
      type: 'Node',
    },
    {
      id: 'node2',
      name: 'node2',
      type: 'Node',
    },
  ],
  calls: [
    {
      source: 'app1',
      target: 'app2',
      type: 'TracingTo',
    },
    {
      source: 'app1',
      target: 'process1',
      type: 'CreateOn',
    },
    {
      source: 'app1',
      target: 'process2',
      type: 'CreateOn',
    },
    {
      source: 'process1',
      target: 'pod1',
      type: 'CreateOn',
    },
    {
      source: 'process2',
      target: 'pod1',
      type: 'CreateOn',
    },
    {
      source: 'pod1',
      target: 'node1',
      type: 'CreateOn',
    },
    {
      source: 'app2',
      target: 'process3',
      type: 'CreateOn',
    },
    {
      source: 'app2',
      target: 'process4',
      type: 'CreateOn',
    },
    {
      source: 'process3',
      target: 'pod2',
      type: 'CreateOn',
    },
    {
      source: 'process4',
      target: 'pod2',
      type: 'CreateOn',
    },
    {
      source: 'pod2',
      target: 'node2',
      type: 'CreateOn',
    },
  ],
};

export default LOCAL_STATE_TOPO;
