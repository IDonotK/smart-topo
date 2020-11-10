export const NODES = [
  {
    id: 'a1',
    name: 'App1',
    type: 'App',
    state: 'Event',
  },
  {
    id: 'a2',
    name: 'App2',
    type: 'App',
    state: 'Event',
  },
  {
    id: 'a3',
    name: 'App3',
    type: 'App',
    state: 'Normal',
  },
  {
    id: 'a4',
    name: 'App4',
    type: 'App',
    state: 'Normal',
  },
  {
    id: 'a5',
    name: 'App5',
    type: 'App',
    state: 'Normal',
  },
  {
    id: 'a6',
    name: 'App6',
    type: 'App',
    state: 'Event',
  },
  {
    id: 'a7',
    name: 'App7',
    type: 'App',
    state: 'Normal',
  },
  {
    id: 'a8',
    name: 'App8',
    type: 'App',
    state: 'Normal',
  },
  {
    id: 'a9',
    name: 'App9',
    type: 'App',
    state: 'Normal',
  },
  {
    id: 'a10',
    name: 'App10',
    type: 'App',
    state: 'Event',
  },
  {
    id: 'a11',
    name: 'App11',
    type: 'App',
    state: 'Normal',
  },
  {
    id: 'a12',
    name: 'App12',
    type: 'App',
    state: 'Normal',
  },
  {
    id: 'a13',
    name: 'App13',
    type: 'App',
    state: 'Normal',
  },
  {
    id: 'a14',
    name: 'App14',
    type: 'App',
    state: 'Event',
  },
  {
    id: 'a15',
    name: 'App15',
    type: 'App',
    state: 'Normal',
  },
  {
    id: 'a16',
    name: 'App16',
    type: 'App',
    state: 'Normal',
  },

  {
    id: 'm1',
    name: 'Middleware1',
    type: 'Middleware',
    state: 'Event',
  },
  {
    id: 'm2',
    name: 'Middleware2',
    type: 'Middleware',
    state: 'Normal',
  },
  {
    id: 'm3',
    name: 'Middleware3',
    type: 'Middleware',
    state: 'Normal',
  },

  {
    id: 'ps1',
    name: 'Process1',
    type: 'Process',
    state: 'Normal',
  },
  {
    id: 'ps2',
    name: 'Process2',
    type: 'Process',
    state: 'Event',
  },
  {
    id: 'ps3',
    name: 'Process3',
    type: 'Process',
    state: 'Normal',
  },
  {
    id: 'ps4',
    name: 'Process4',
    type: 'Process',
    state: 'Normal',
  },
  {
    id: 'ps5',
    name: 'Process5',
    type: 'Process',
    state: 'Normal',
  },
  {
    id: 'ps6',
    name: 'Process6',
    type: 'Process',
    state: 'Normal',
  },
  {
    id: 'ps7',
    name: 'Process7',
    type: 'Process',
    state: 'Normal',
  },
  {
    id: 'ps8',
    name: 'Process8',
    type: 'Process',
    state: 'Normal',
  },

  {
    id: 'd1',
    name: 'Deployment1',
    type: 'Deployment',
    state: 'Normal',
  },
  {
    id: 'd2',
    name: 'Deployment2',
    type: 'Deployment',
    state: 'Event',
  },
  {
    id: 'd3',
    name: 'Deployment3',
    type: 'Deployment',
    state: 'Normal',
  },
  {
    id: 'd4',
    name: 'Deployment4',
    type: 'Deployment',
    state: 'Normal',
  },
  {
    id: 'd5',
    name: 'Deployment5',
    type: 'Deployment',
    state: 'Normal',
  },
  {
    id: 'd6',
    name: 'Deployment6',
    type: 'Deployment',
    state: 'Normal',
  },

  {
    id: 'pd1',
    name: 'Pod1',
    type: 'Pod',
    state: 'Normal',
  },
  {
    id: 'pd2',
    name: 'Pod2',
    type: 'Pod',
    state: 'Event',
  },
  {
    id: 'pd3',
    name: 'Pod3',
    type: 'Pod',
    state: 'Normal',
  },
  {
    id: 'pd4',
    name: 'Pod4',
    type: 'Pod',
    state: 'Normal',
  },

  {
    id: 'n1',
    name: 'Node1',
    type: 'Node',
    state: 'Event',
  },
  {
    id: 'n2',
    name: 'Node2',
    type: 'Node',
    state: 'Normal',
  },
];

export const LINKS = [
  {
    id: 0,
    name: 'link0',
    type: 'createon',
    sid: 'pd1',
    tid: 'n1',
  },
  {
    id: 1,
    name: 'link1',
    type: 'createon',
    sid: 'pd2',
    tid: 'n1',
  },
  {
    id: 2,
    name: 'link2',
    type: 'createon',
    sid: 'pd3',
    tid: 'n2',
  },
  {
    id: 3,
    name: 'link3',
    type: 'createon',
    sid: 'pd4',
    tid: 'n2',
  },

  {
    id: 4,
    name: 'link4',
    type: 'createon',
    sid: 'd1',
    tid: 'pd1',
  },
  {
    id: 5,
    name: 'link5',
    type: 'createon',
    sid: 'd2',
    tid: 'pd1',
  },
  {
    id: 6,
    name: 'link6',
    type: 'createon',
    sid: 'd3',
    tid: 'pd2',
  },
  {
    id: 7,
    name: 'link7',
    type: 'createon',
    sid: 'd4',
    tid: 'pd2',
  },
  {
    id: 8,
    name: 'link8',
    type: 'createon',
    sid: 'd5',
    tid: 'pd3',
  },
  {
    id: 9,
    name: 'link9',
    type: 'createon',
    sid: 'd6',
    tid: 'pd4',
  },

  {
    id: 10,
    name: 'link10',
    type: 'createon',
    sid: 'ps1',
    tid: 'd1',
  },
  {
    id: 11,
    name: 'link11',
    type: 'createon',
    sid: 'ps2',
    tid: 'd1',
  },
  {
    id: 12,
    name: 'link12',
    type: 'createon',
    sid: 'ps3',
    tid: 'd2',
  },
  {
    id: 13,
    name: 'link13',
    type: 'createon',
    sid: 'ps4',
    tid: 'd2',
  },
  {
    id: 14,
    name: 'link14',
    type: 'createon',
    sid: 'ps5',
    tid: 'd3',
  },
  {
    id: 15,
    name: 'link15',
    type: 'createon',
    sid: 'ps6',
    tid: 'd4',
  },
  {
    id: 16,
    name: 'link16',
    type: 'createon',
    sid: 'ps7',
    tid: 'd5',
  },
  {
    id: 17,
    name: 'link17',
    type: 'createon',
    sid: 'ps8',
    tid: 'd6',
  },

  {
    id: 18,
    name: 'link18',
    type: 'createon',
    sid: 'm1',
    tid: 'ps1',
  },
  {
    id: 19,
    name: 'link19',
    type: 'createon',
    sid: 'm2',
    tid: 'ps2',
  },
  {
    id: 20,
    name: 'link20',
    type: 'createon',
    sid: 'm3',
    tid: 'ps3',
  },
  {
    id: 21,
    name: 'link21',
    type: 'tracingto',
    sid: 'm1',
    tid: 'm2',
  },

  {
    id: 22,
    name: 'link22',
    type: 'tracingto',
    sid: 'a1',
    tid: 'm1',
  },
  {
    id: 23,
    name: 'link23',
    type: 'tracingto',
    sid: 'a2',
    tid: 'm1',
  },
  {
    id: 24,
    name: 'link24',
    type: 'tracingto',
    sid: 'a3',
    tid: 'm2',
  },

  {
    id: 25,
    name: 'link25',
    type: 'createon',
    sid: 'a1',
    tid: 'ps1',
  },
  {
    id: 26,
    name: 'link26',
    type: 'createon',
    sid: 'a2',
    tid: 'ps1',
  },
  {
    id: 27,
    name: 'link27',
    type: 'createon',
    sid: 'a3',
    tid: 'ps2',
  },
  {
    id: 28,
    name: 'link28',
    type: 'createon',
    sid: 'a4',
    tid: 'ps2',
  },
  {
    id: 29,
    name: 'link29',
    type: 'createon',
    sid: 'a5',
    tid: 'ps3',
  },
  {
    id: 30,
    name: 'link30',
    type: 'createon',
    sid: 'a6',
    tid: 'ps3',
  },
  {
    id: 31,
    name: 'link31',
    type: 'createon',
    sid: 'a7',
    tid: 'ps4',
  },
  {
    id: 32,
    name: 'link32',
    type: 'createon',
    sid: 'a8',
    tid: 'ps4',
  },
  {
    id: 33,
    name: 'link33',
    type: 'createon',
    sid: 'a9',
    tid: 'ps5',
  },
  {
    id: 34,
    name: 'link34',
    type: 'createon',
    sid: 'a10',
    tid: 'ps5',
  },
  {
    id: 35,
    name: 'link35',
    type: 'createon',
    sid: 'a11',
    tid: 'ps6',
  },
  {
    id: 36,
    name: 'link36',
    type: 'createon',
    sid: 'a12',
    tid: 'ps6',
  },
  {
    id: 37,
    name: 'link37',
    type: 'createon',
    sid: 'a13',
    tid: 'ps7',
  },
  {
    id: 38,
    name: 'link38',
    type: 'createon',
    sid: 'a14',
    tid: 'ps7',
  },
  {
    id: 39,
    name: 'link39',
    type: 'createon',
    sid: 'a15',
    tid: 'ps8',
  },
  {
    id: 40,
    name: 'link40',
    type: 'createon',
    sid: 'a16',
    tid: 'ps8',
  },

  {
    id: 41,
    name: 'link41',
    type: 'tracingto',
    sid: 'a1',
    tid: 'a2',
  },
  {
    id: 42,
    name: 'link42',
    type: 'tracingto',
    sid: 'a1',
    tid: 'a3',
  },
  {
    id: 43,
    name: 'link43',
    type: 'tracingto',
    sid: 'a1',
    tid: 'a4',
  },
  {
    id: 44,
    name: 'link44',
    type: 'tracingto',
    sid: 'a1',
    tid: 'a5',
  },
  {
    id: 45,
    name: 'link45',
    type: 'tracingto',
    sid: 'a1',
    tid: 'a6',
  },
  {
    id: 46,
    name: 'link46',
    type: 'tracingto',
    sid: 'a2',
    tid: 'a6',
  },
  {
    id: 47,
    name: 'link47',
    type: 'tracingto',
    sid: 'a2',
    tid: 'a7',
  },
  {
    id: 48,
    name: 'link48',
    type: 'tracingto',
    sid: 'a3',
    tid: 'a8',
  },
  {
    id: 49,
    name: 'link49',
    type: 'tracingto',
    sid: 'a3',
    tid: 'a9',
  },
  {
    id: 50,
    name: 'link50',
    type: 'tracingto',
    sid: 'a4',
    tid: 'a10',
  },
  {
    id: 51,
    name: 'link51',
    type: 'tracingto',
    sid: 'a5',
    tid: 'a11',
  },
  {
    id: 52,
    name: 'link52',
    type: 'tracingto',
    sid: 'a5',
    tid: 'a12',
  },
];
