/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Commit, ActionTree, Dispatch } from 'vuex';
import graph from '@/graph';
import * as types from '../../mutation-types';
import axios, { AxiosPromise, AxiosResponse } from 'axios';
import { cancelToken } from '@/utils/cancelToken';

interface Option {
  key: string;
  label: string;
}
export interface Duration {
  start: string;
  end: string;
  step: string;
}
export interface Call {
  avgResponseTime: number;
  cpm: number;
  isAlert: boolean;
  source: string | any;
  target: string | any;
  id: string;
  detectPoints: string[];
}
interface Node {
  apdex: number;
  avgResponseTime: number;
  cpm: number;
  id: string;
  isAlarm: boolean;
  name: string;
  numOfServer: number;
  numOfServerAlarm: number;
  numOfServiceAlarm: number;
  sla: number;
  type: string;
}

export interface EndpointDependencyConidition {
  serviceName: string;
  endpointName: string;
  destServiceName: string;
  destEndpointName: string;
  duration: Duration;
}

export interface State {
  callback: any;
  calls: Call[];
  nodes: Node[];
  detectPoints: string[];
  selectedServiceCall: Call | null;
  currentNode: any;
  currentLink: any;
  current: Option;
  mode: boolean;
  getResponseTimeTrend: number[];
  getSLATrend: number[];
  getThroughputTrend: number[];
  responsePercentile: { [key: string]: number[] };
  instanceDependency: {
    calls: Call[];
    nodes: Node[];
  };
  endpointDependency: {
    calls: Call[];
    nodes: Node[];
  };
  selectedInstanceCall: Call | null;
  instanceDependencyMetrics: { [key: string]: any };
  endpointDependencyMetrics: { [key: string]: any };
  currentEndpointDepth: { key: number; label: string };
  queryInstanceMetricsType: string;
  serviceThroughput: { Throughput: number[] };
  serviceSLA: { SLA: number[] };
  serviceResponseTime: { ResponseTime: number[] };
  servicePercentile: { [key: string]: number[] };
  serviceApdexScore: { ApdexScore: number[] };
  topoEndpoints: any[];
  topoInstances: any[];
  filterNodeType: string;
}

const PercentileItem: string[] = ['p50', 'p75', 'p90', 'p95', 'p99'];

const initState: State = {
  callback: '',
  mode: true,
  detectPoints: [],
  selectedServiceCall: null,
  calls: [],
  nodes: [],
  currentNode: {},
  currentLink: {},
  current: {
    key: 'default',
    label: 'default',
  },
  getResponseTimeTrend: [],
  getSLATrend: [],
  getThroughputTrend: [],
  responsePercentile: {},
  instanceDependency: {
    calls: [],
    nodes: [],
  },
  endpointDependency: {
    calls: [],
    nodes: [],
  },
  selectedInstanceCall: null,
  instanceDependencyMetrics: {},
  endpointDependencyMetrics: {},
  currentEndpointDepth: { key: 2, label: '2' },
  queryInstanceMetricsType: '',
  serviceThroughput: { Throughput: [] },
  serviceSLA: { SLA: [] },
  serviceResponseTime: { ResponseTime: [] },
  servicePercentile: {
    p50: [],
    p75: [],
    p90: [],
    p95: [],
    p99: [],
  },
  serviceApdexScore: { ApdexScore: [] },
  topoEndpoints: [],
  topoInstances: [],
  filterNodeType: 'All',
};

// getters
const getters = {};

// mutations
const mutations = {
  [types.SET_CALLBACK](state: State, data: any) {
    state.callback = data;
  },
  [types.SET_MODE](state: State, data: string[]) {
    state.detectPoints = data;
    const temp = state.mode ? 'SERVER' : 'CLIENT';
    if (data.indexOf(temp) === -1) {
      state.mode = !state.mode;
    }
  },
  [types.SET_MODE_STATUS](state: State, data: boolean) {
    state.mode = data;
  },
  [types.SET_NODE](state: State, data: any) {
    state.currentNode = data;
  },
  [types.SET_FILTER_NODE_TYPE](state: State, data: any) {
    state.filterNodeType = data;
  },
  [types.SET_LINK](state: State, data: any) {
    state.currentLink = data;
  },
  [types.SET_TOPO](state: State, data: any) {
    state.calls = data.calls;
    state.nodes = data.nodes;
  },
  [types.SET_SELECTED_CALL](state: State, data: any) {
    state.selectedServiceCall = data;
  },
  [types.SET_TOPO_RELATION](state: State, data: any) {
    state.getResponseTimeTrend = data.getResponseTimeTrend
      ? data.getResponseTimeTrend.values.map((i: any) => i.value)
      : [];
    state.getSLATrend = data.getSLATrend ? data.getSLATrend.values.map((i: any) => i.value) : [];
    state.getThroughputTrend = data.getThroughputTrend ? data.getThroughputTrend.values.map((i: any) => i.value) : [];

    if (!data.getPercentile) {
      state.responsePercentile = {};
      return;
    }
    data.getPercentile.forEach((item: any, index: number) => {
      state.responsePercentile[PercentileItem[index]] = item.values.map((i: any) => i.value);
    });
  },
  [types.SET_INSTANCE_DEPENDENCY](state: State, data: any) {
    state.instanceDependency = data;
  },
  [types.SET_SELECTED_INSTANCE_CALL](state: State, data: Call) {
    state.selectedInstanceCall = data;
  },
  [types.SET_INSTANCE_DEPEDENCE_METRICS](state: State, data: any) {
    state.instanceDependencyMetrics.getResponseTimeTrend = data.getResponseTimeTrend
      ? data.getResponseTimeTrend.values.map((i: any) => i.value)
      : [];
    state.instanceDependencyMetrics.getSLATrend = data.getSLATrend
      ? data.getSLATrend.values.map((i: any) => i.value)
      : [];
    state.instanceDependencyMetrics.getThroughputTrend = data.getThroughputTrend
      ? data.getThroughputTrend.values.map((i: any) => i.value)
      : [];
    state.instanceDependencyMetrics.percentResponse = {};
    if (!data.getPercentile) {
      return;
    }
    data.getPercentile.forEach((item: any, index: number) => {
      state.instanceDependencyMetrics.percentResponse[PercentileItem[index]] = item.values.map((i: any) => i.value);
    });
  },
  [types.SET_ENDPOINT_DEPENDENCY_METRICS](state: State, data: { [key: string]: any }) {
    state.endpointDependencyMetrics.cpm = data.endpointRelationCpm
      ? data.endpointRelationCpm.values.values.map((i: any) => i.value)
      : [];
    state.endpointDependencyMetrics.respTime = data.endpointRelationRespTime
      ? data.endpointRelationRespTime.values.values.map((i: any) => i.value)
      : [];
    state.endpointDependencyMetrics.sla = data.endpointRelationSla
      ? data.endpointRelationSla.values.values.map((i: any) => i.value)
      : [];
    state.endpointDependencyMetrics.percentile = {};
    if (!data.endpointRelationPercentile) {
      return;
    }
    for (const item of data.endpointRelationPercentile) {
      state.endpointDependencyMetrics.percentile[PercentileItem[Number(item.label)]] = item.values.values.map(
        (i: any) => i.value,
      );
    }
  },
  [types.SET_INSTANCE_DEPEDENCE_TYPE](state: State, data: string) {
    state.queryInstanceMetricsType = data;
  },
  [types.SET_SERVICE_DETAIL](state: State, data: any) {
    state.serviceApdexScore = data.serviceApdexScore
      ? data.serviceApdexScore.values.map((i: any) => Number((i.value / 10000).toFixed(2)))
      : [];
    state.serviceResponseTime = data.serviceResponseTime
      ? data.serviceResponseTime.values.map((i: any) => i.value)
      : [];
    state.serviceThroughput = data.serviceThroughput ? data.serviceThroughput.values.map((i: any) => i.value) : [];
    state.serviceSLA = data.serviceSLA ? data.serviceSLA.values.map((i: any) => i.value / 100) : [];
    if (!data.servicePercentile) {
      return;
    }
    data.servicePercentile.forEach((item: any, index: number) => {
      state.servicePercentile[PercentileItem[index]] = item.values.map((i: any) => i.value);
    });
  },
  [types.SET_TOPO_ENDPOINT](state: State, data: any[]) {
    state.topoEndpoints = data;
    window.localStorage.setItem('topologyEndpoints', JSON.stringify(data));
  },
  [types.SET_TOPO_INSTANCE](state: State, data: any[]) {
    state.topoInstances = data;
    window.localStorage.setItem('topologyInstances', JSON.stringify(data));
  },
  [types.EDIT_TOPO_INSTANCE_CONFIG](state: State, params: { values: any; index: number }) {
    state.topoInstances[params.index] = { ...state.topoInstances[params.index], ...params.values };
    window.localStorage.setItem('topologyInstances', JSON.stringify(state.topoInstances));
  },
  [types.EDIT_TOPO_ENDPOINT_CONFIG](state: State, params: { values: any; index: number }) {
    state.topoEndpoints[params.index] = { ...state.topoEndpoints[params.index], ...params.values };
    window.localStorage.setItem('topologyEndpoints', JSON.stringify(state.topoEndpoints));
  },
  [types.DELETE_TOPO_ENDPOINT](state: State, index: number) {
    state.topoEndpoints.splice(index, 1);
    window.localStorage.setItem('topologyEndpoints', JSON.stringify(state.topoEndpoints));
  },
  [types.DELETE_TOPO_INSTANCE](state: State, index: number) {
    state.topoInstances.splice(index, 1);
    window.localStorage.setItem('topologyInstances', JSON.stringify(state.topoInstances));
  },
  [types.ADD_TOPO_INSTANCE_COMP](state: State) {
    const comp = {
      width: 3,
      title: 'Title',
      height: 350,
      entityType: 'ServiceInstance',
      independentSelector: false,
      metricType: 'UNKNOWN',
    };
    state.topoInstances.push(comp);
    window.localStorage.setItem('topologyInstances', JSON.stringify(state.topoInstances));
  },
  [types.ADD_TOPO_ENDPOINT_COMP](state: State) {
    const comp = {
      width: 3,
      title: 'Title',
      height: 350,
      entityType: 'Endpoint',
      independentSelector: false,
      metricType: 'UNKNOWN',
    };
    state.topoEndpoints.push(comp);
    window.localStorage.setItem('topologyEndpoints', JSON.stringify(state.topoEndpoints));
  },
  [types.SET_ENDPOINT_DEPENDENCY](state: State, data: { calls: Call[]; nodes: Node[] }) {
    state.endpointDependency = data;
  },
  [types.SET_ENDPOINT_DEPTH](state: State, data: { key: number; label: string }) {
    state.currentEndpointDepth = data;
  },
};

// actions
const actions: ActionTree<State, any> = {
  GET_SERVICES(context: { commit: Commit }, params: { duration: Duration; keyword: string }) {
    if (!params.keyword) {
      params.keyword = '';
    }
    // return graph
    //   .query('queryServices')
    //   .params(params)
    //   .then((res: AxiosResponse) => {
    //     return res.data.data.services || [];
    //   });
    // luke
    return Promise.resolve().then(() => {
      var res = {
        "data": {
          "services": [{
            "key": "bG9hZCBiYWxhbmNlcjEuc3lzdGVt.1",
            "label": "load balancer1.system"
          }, {
            "key": "bG9hZCBiYWxhbmNlcjIuc3lzdGVt.1",
            "label": "load balancer2.system"
          }, {
            "key": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1",
            "label": "projectC.business-zone"
          }, {
            "key": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1",
            "label": "projectA.business-zone"
          }, {
            "key": "cHJvamVjdEIuYnVzaW5lc3Mtem9uZQ==.1",
            "label": "projectB.business-zone"
          }, {
            "key": "cHJvamVjdEQuYnVzaW5lc3Mtem9uZQ==.1",
            "label": "projectD.business-zone"
          }]
        }
      };
      return res.data.services || [];
    });
  },
  GET_SERVICE_ENDPOINTS(context: { commit: Commit }, params: { serviceId: string; keyword: string }) {
    if (!params.serviceId) {
      return new Promise((resolve) => resolve());
    }
    if (!params.keyword) {
      params.keyword = '';
    }
    return graph
      .query('queryEndpoints')
      .params(params)
      .then((res: AxiosResponse) => {
        return res.data.data.getEndpoints || [];
      });
  },
  CLEAR_TOPO(context: { commit: Commit; state: State }) {
    context.commit(types.SET_TOPO, { calls: [], nodes: [] });
  },
  CLEAR_TOPO_INFO(context: { commit: Commit; state: State }) {
    context.commit(types.SET_TOPO_RELATION, {});
    context.commit(types.SET_SELECTED_CALL, null);
  },
  GET_INSTANCE_DEPENDENCY_METRICS(
    context: { commit: Commit; state: State; dispatch: Dispatch; getters: any },
    params: any,
  ) {
    if (params.mode === 'SERVER') {
      params.queryType = 'queryTopoInstanceServerInfo';
      context.dispatch('INSTANCE_RELATION_INFO', params);
    }
    if (params.mode === 'CLIENT') {
      params.queryType = 'queryTopoInstanceClientInfo';
      context.dispatch('INSTANCE_RELATION_INFO', params);
    }
  },
  GET_TOPO_SERVICE_INFO(context: { commit: Commit; state: State }, params: { id: string; duration: Duration }) {
    if (!params.id) {
      return;
    }
    return graph
      .query('queryTopoServiceInfo')
      .params({
        id: params.id,
        duration: params.duration,
      })
      .then((res: AxiosResponse) => {
        if (!res.data.data) {
          return;
        }
        context.commit('SET_TOPO_RELATION', res.data.data);
        context.commit(types.SET_SELECTED_CALL, params);
      });
  },
  GET_TOPO_CLIENT_INFO(context: { commit: Commit; state: State }, params: any) {
    return graph
      .query('queryTopoClientInfo')
      .params(params)
      .then((res: AxiosResponse) => {
        if (!res.data.data) {
          return;
        }
        context.commit('SET_TOPO_RELATION', res.data.data);
        context.commit(types.SET_SELECTED_CALL, params);
      });
  },
  GET_TOPO_SERVICE_DETAIL(
    context: { commit: Commit; state: State },
    params: { serviceId: string; duration: Duration },
  ) {
    return graph
      .query('queryTopoServiceDetail')
      .params({
        serviceId: params.serviceId,
        duration: params.duration,
      })
      .then((res: AxiosResponse) => {
        if (!res.data.data) {
          return;
        }
        context.commit('SET_SERVICE_DETAIL', res.data.data);
      });
  },
  GET_TOPO(context: { commit: Commit; state: State }, params: any) {
    let query = 'queryTopo';
    if (params.serviceId) {
      query = 'queryServiceTopo';
    }
    if (params.serviceIds) {
      query = 'queryServicesTopo';
    }
    // return graph
    //   .query(query)
    //   .params(params)
    //   .then((res: AxiosResponse) => {
    //     if (res.data.errors) {
    //       context.commit(types.SET_TOPO, { calls: [], nodes: [] });
    //       return;
    //     }
    //     const calls = res.data.data.topo.calls;
    //     const nodes = res.data.data.topo.nodes;
    //     const ids = nodes.map((i: any) => i.id);
    //     const idsC = calls.filter((i: any) => i.detectPoints.indexOf('CLIENT') !== -1).map((b: any) => b.id);
    //     const idsS = calls.filter((i: any) => i.detectPoints.indexOf('CLIENT') === -1).map((b: any) => b.id);
    //     return graph
    //       .query('queryTopoInfo')
    //       .params({ ...params, ids, idsC, idsS })
    //       .then((info: AxiosResponse) => {
    //         const resInfo = info.data.data;
    //         if (!resInfo.sla) {
    //           return context.commit(types.SET_TOPO, { calls, nodes });
    //         }
    //         for (let i = 0; i < resInfo.sla.values.length; i += 1) {
    //           for (let j = 0; j < nodes.length; j += 1) {
    //             if (nodes[j].id === resInfo.sla.values[i].id) {
    //               nodes[j] = {
    //                 ...nodes[j],
    //                 isGroupActive: true,
    //                 sla: resInfo.sla.values[i].value ? resInfo.sla.values[i].value / 100 : -1,
    //                 cpm: resInfo.nodeCpm.values[i] ? resInfo.nodeCpm.values[i].value : -1,
    //                 latency: resInfo.nodeLatency.values[i] ? resInfo.nodeLatency.values[i].value : -1,
    //               };
    //             }
    //           }
    //         }
    //         if (!resInfo.cpmC) {
    //           return context.commit(types.SET_TOPO, { calls, nodes });
    //         }
    //         for (let i = 0; i < resInfo.cpmC.values.length; i += 1) {
    //           for (let j = 0; j < calls.length; j += 1) {
    //             if (calls[j].id === resInfo.cpmC.values[i].id) {
    //               calls[j] = {
    //                 ...calls[j],
    //                 isGroupActive: true,
    //                 cpm: resInfo.cpmC.values[i] ? resInfo.cpmC.values[i].value : '',
    //                 latency: resInfo.latencyC.values[i] ? resInfo.latencyC.values[i].value : '',
    //               };
    //             }
    //           }
    //         }
    //         if (!resInfo.cpmS) {
    //           return context.commit(types.SET_TOPO, { calls, nodes });
    //         }
    //         for (let i = 0; i < resInfo.cpmS.values.length; i += 1) {
    //           for (let j = 0; j < calls.length; j += 1) {
    //             if (calls[j].id === resInfo.cpmS.values[i].id) {
    //               calls[j] = {
    //                 ...calls[j],
    //                 cpm: resInfo.cpmS.values[i] ? resInfo.cpmS.values[i].value : '',
    //                 latency: resInfo.latencyS.values[i] ? resInfo.latencyS.values[i].value : '',
    //               };
    //             }
    //           }
    //         }
    //         context.commit(types.SET_TOPO, { calls, nodes });
    //       });
    //   });

    // luke 
    return Promise.resolve().then(() => {
      // queryTopo
      var res = {
        "data": {
          "topo": {
            "nodes": [{
              "id": "d3d3LmJhaWR1LmNvbTo4MA==.0",
              "name": "www.baidu.com:80",
              "type": "HttpClient",
              "isReal": false
            }, {
              "id": "bG9hZCBiYWxhbmNlcjEuc3lzdGVt.1",
              "name": "load balancer1.system",
              "type": "Nginx",
              "isReal": true
            }, {
              "id": "VXNlcg==.0",
              "name": "User",
              "type": "USER",
              "isReal": false
            }, {
              "id": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1",
              "name": "projectC.business-zone",
              "type": "SpringMVC",
              "isReal": true
            }, {
              "id": "MTkyLjE2OC4yNTIuMTI6ODc2MQ==.0",
              "name": "192.168.252.12:8761",
              "type": "HttpClient",
              "isReal": false
            }, {
              "id": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1",
              "name": "projectA.business-zone",
              "type": "SpringMVC",
              "isReal": true
            }, {
              "id": "cHJvamVjdEIuYnVzaW5lc3Mtem9uZQ==.1",
              "name": "projectB.business-zone",
              "type": "SpringMVC",
              "isReal": true
            }, {
              "id": "bG9jYWxob3N0Ojg3NjE=.0",
              "name": "localhost:8761",
              "type": "HttpClient",
              "isReal": false
            }, {
              "id": "MTI3LjAuMC4xOjkwOTI=.0",
              "name": "127.0.0.1:9092",
              "type": "Kafka",
              "isReal": false
            }, {
              "id": "bG9hZCBiYWxhbmNlcjIuc3lzdGVt.1",
              "name": "load balancer2.system",
              "type": "Nginx",
              "isReal": true
            }, {
              "id": "bG9jYWxob3N0Oi0x.0",
              "name": "localhost:-1",
              "type": "H2",
              "isReal": false
            }, {
              "id": "cHJvamVjdEQuYnVzaW5lc3Mtem9uZQ==.1",
              "name": "projectD.business-zone",
              "type": "kafka-consumer",
              "isReal": true
            }],
            "calls": [{
              "id": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1-d3d3LmJhaWR1LmNvbTo4MA==.0",
              "source": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1",
              "detectPoints": ["CLIENT"],
              "target": "d3d3LmJhaWR1LmNvbTo4MA==.0"
            }, {
              "id": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1-MTkyLjE2OC4yNTIuMTI6ODc2MQ==.0",
              "source": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1",
              "detectPoints": ["CLIENT"],
              "target": "MTkyLjE2OC4yNTIuMTI6ODc2MQ==.0"
            }, {
              "id": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1-bG9jYWxob3N0Ojg3NjE=.0",
              "source": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1",
              "detectPoints": ["CLIENT"],
              "target": "bG9jYWxob3N0Ojg3NjE=.0"
            }, {
              "id": "cHJvamVjdEIuYnVzaW5lc3Mtem9uZQ==.1-MTkyLjE2OC4yNTIuMTI6ODc2MQ==.0",
              "source": "cHJvamVjdEIuYnVzaW5lc3Mtem9uZQ==.1",
              "detectPoints": ["CLIENT"],
              "target": "MTkyLjE2OC4yNTIuMTI6ODc2MQ==.0"
            }, {
              "id": "cHJvamVjdEIuYnVzaW5lc3Mtem9uZQ==.1-bG9jYWxob3N0Ojg3NjE=.0",
              "source": "cHJvamVjdEIuYnVzaW5lc3Mtem9uZQ==.1",
              "detectPoints": ["CLIENT"],
              "target": "bG9jYWxob3N0Ojg3NjE=.0"
            }, {
              "id": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1-MTI3LjAuMC4xOjkwOTI=.0",
              "source": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1",
              "detectPoints": ["CLIENT"],
              "target": "MTI3LjAuMC4xOjkwOTI=.0"
            }, {
              "id": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1-MTkyLjE2OC4yNTIuMTI6ODc2MQ==.0",
              "source": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1",
              "detectPoints": ["CLIENT"],
              "target": "MTkyLjE2OC4yNTIuMTI6ODc2MQ==.0"
            }, {
              "id": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1-cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1",
              "source": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1",
              "detectPoints": ["CLIENT", "SERVER"],
              "target": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1"
            }, {
              "id": "bG9hZCBiYWxhbmNlcjEuc3lzdGVt.1-bG9hZCBiYWxhbmNlcjIuc3lzdGVt.1",
              "source": "bG9hZCBiYWxhbmNlcjEuc3lzdGVt.1",
              "detectPoints": ["CLIENT", "SERVER"],
              "target": "bG9hZCBiYWxhbmNlcjIuc3lzdGVt.1"
            }, {
              "id": "bG9hZCBiYWxhbmNlcjIuc3lzdGVt.1-cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1",
              "source": "bG9hZCBiYWxhbmNlcjIuc3lzdGVt.1",
              "detectPoints": ["CLIENT", "SERVER"],
              "target": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1"
            }, {
              "id": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1-cHJvamVjdEIuYnVzaW5lc3Mtem9uZQ==.1",
              "source": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1",
              "detectPoints": ["CLIENT", "SERVER"],
              "target": "cHJvamVjdEIuYnVzaW5lc3Mtem9uZQ==.1"
            }, {
              "id": "cHJvamVjdEIuYnVzaW5lc3Mtem9uZQ==.1-bG9jYWxob3N0Oi0x.0",
              "source": "cHJvamVjdEIuYnVzaW5lc3Mtem9uZQ==.1",
              "detectPoints": ["CLIENT"],
              "target": "bG9jYWxob3N0Oi0x.0"
            }, {
              "id": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1-bG9jYWxob3N0Ojg3NjE=.0",
              "source": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1",
              "detectPoints": ["CLIENT"],
              "target": "bG9jYWxob3N0Ojg3NjE=.0"
            }, {
              "id": "MTI3LjAuMC4xOjkwOTI=.0-cHJvamVjdEQuYnVzaW5lc3Mtem9uZQ==.1",
              "source": "MTI3LjAuMC4xOjkwOTI=.0",
              "detectPoints": ["SERVER"],
              "target": "cHJvamVjdEQuYnVzaW5lc3Mtem9uZQ==.1"
            }, {
              "id": "VXNlcg==.0-bG9hZCBiYWxhbmNlcjEuc3lzdGVt.1",
              "source": "VXNlcg==.0",
              "detectPoints": ["SERVER"],
              "target": "bG9hZCBiYWxhbmNlcjEuc3lzdGVt.1"
            }]
          }
        }
      };
      const calls = res.data.topo.calls;
      const nodes = res.data.topo.nodes;
      const ids = nodes.map((i: any) => i.id);
      // luke？
      const idsC = calls.filter((i: any) => i.detectPoints.indexOf('CLIENT') !== -1).map((b: any) => b.id);
      const idsS = calls.filter((i: any) => i.detectPoints.indexOf('CLIENT') === -1).map((b: any) => b.id);

      // queryTopoInfo
      var info = {
        "data": {
          "sla": {
            "values": [{
              "id": "d3d3LmJhaWR1LmNvbTo4MA==.0",
              "value": 0
            }, {
              "id": "bG9hZCBiYWxhbmNlcjEuc3lzdGVt.1",
              "value": 10000
            }, {
              "id": "VXNlcg==.0",
              "value": 0
            }, {
              "id": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1",
              "value": 10000
            }, {
              "id": "MTkyLjE2OC4yNTIuMTI6ODc2MQ==.0",
              "value": 0
            }, {
              "id": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1",
              "value": 10000
            }, {
              "id": "cHJvamVjdEIuYnVzaW5lc3Mtem9uZQ==.1",
              "value": 10000
            }, {
              "id": "bG9jYWxob3N0Ojg3NjE=.0",
              "value": 0
            }, {
              "id": "MTI3LjAuMC4xOjkwOTI=.0",
              "value": 0
            }, {
              "id": "bG9hZCBiYWxhbmNlcjIuc3lzdGVt.1",
              "value": 10000
            }, {
              "id": "bG9jYWxob3N0Oi0x.0",
              "value": 0
            }, {
              "id": "cHJvamVjdEQuYnVzaW5lc3Mtem9uZQ==.1",
              "value": 10000
            }]
          },
          "nodeCpm": {
            "values": [{
              "id": "d3d3LmJhaWR1LmNvbTo4MA==.0",
              "value": 0
            }, {
              "id": "bG9hZCBiYWxhbmNlcjEuc3lzdGVt.1",
              "value": 202
            }, {
              "id": "VXNlcg==.0",
              "value": 0
            }, {
              "id": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1",
              "value": 213
            }, {
              "id": "MTkyLjE2OC4yNTIuMTI6ODc2MQ==.0",
              "value": 0
            }, {
              "id": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1",
              "value": 200
            }, {
              "id": "cHJvamVjdEIuYnVzaW5lc3Mtem9uZQ==.1",
              "value": 201
            }, {
              "id": "bG9jYWxob3N0Ojg3NjE=.0",
              "value": 0
            }, {
              "id": "MTI3LjAuMC4xOjkwOTI=.0",
              "value": 0
            }, {
              "id": "bG9hZCBiYWxhbmNlcjIuc3lzdGVt.1",
              "value": 202
            }, {
              "id": "bG9jYWxob3N0Oi0x.0",
              "value": 0
            }, {
              "id": "cHJvamVjdEQuYnVzaW5lc3Mtem9uZQ==.1",
              "value": 202
            }]
          },
          "nodeLatency": {
            "values": [{
              "id": "d3d3LmJhaWR1LmNvbTo4MA==.0",
              "value": 0
            }, {
              "id": "bG9hZCBiYWxhbmNlcjEuc3lzdGVt.1",
              "value": 1892
            }, {
              "id": "VXNlcg==.0",
              "value": 0
            }, {
              "id": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1",
              "value": 4423
            }, {
              "id": "MTkyLjE2OC4yNTIuMTI6ODc2MQ==.0",
              "value": 0
            }, {
              "id": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1",
              "value": 1895
            }, {
              "id": "cHJvamVjdEIuYnVzaW5lc3Mtem9uZQ==.1",
              "value": 510
            }, {
              "id": "bG9jYWxob3N0Ojg3NjE=.0",
              "value": 0
            }, {
              "id": "MTI3LjAuMC4xOjkwOTI=.0",
              "value": 0
            }, {
              "id": "bG9hZCBiYWxhbmNlcjIuc3lzdGVt.1",
              "value": 1891
            }, {
              "id": "bG9jYWxob3N0Oi0x.0",
              "value": 0
            }, {
              "id": "cHJvamVjdEQuYnVzaW5lc3Mtem9uZQ==.1",
              "value": 0
            }]
          },
          "cpmS": {
            "values": [{
              "id": "MTI3LjAuMC4xOjkwOTI=.0-cHJvamVjdEQuYnVzaW5lc3Mtem9uZQ==.1",
              "value": 202
            }, {
              "id": "VXNlcg==.0-bG9hZCBiYWxhbmNlcjEuc3lzdGVt.1",
              "value": 200
            }]
          },
          "latencyS": {
            "values": [{
              "id": "MTI3LjAuMC4xOjkwOTI=.0-cHJvamVjdEQuYnVzaW5lc3Mtem9uZQ==.1",
              "value": 0
            }, {
              "id": "VXNlcg==.0-bG9hZCBiYWxhbmNlcjEuc3lzdGVt.1",
              "value": 0
            }]
          },
          "cpmC": {
            "values": [{
              "id": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1-d3d3LmJhaWR1LmNvbTo4MA==.0",
              "value": 215
            }, {
              "id": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1-MTkyLjE2OC4yNTIuMTI6ODc2MQ==.0",
              "value": 3
            }, {
              "id": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1-bG9jYWxob3N0Ojg3NjE=.0",
              "value": 3
            }, {
              "id": "cHJvamVjdEIuYnVzaW5lc3Mtem9uZQ==.1-MTkyLjE2OC4yNTIuMTI6ODc2MQ==.0",
              "value": 3
            }, {
              "id": "cHJvamVjdEIuYnVzaW5lc3Mtem9uZQ==.1-bG9jYWxob3N0Ojg3NjE=.0",
              "value": 3
            }, {
              "id": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1-MTI3LjAuMC4xOjkwOTI=.0",
              "value": 213
            }, {
              "id": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1-MTkyLjE2OC4yNTIuMTI6ODc2MQ==.0",
              "value": 3
            }, {
              "id": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1-cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1",
              "value": 214
            }, {
              "id": "bG9hZCBiYWxhbmNlcjEuc3lzdGVt.1-bG9hZCBiYWxhbmNlcjIuc3lzdGVt.1",
              "value": 200
            }, {
              "id": "bG9hZCBiYWxhbmNlcjIuc3lzdGVt.1-cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1",
              "value": 202
            }, {
              "id": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1-cHJvamVjdEIuYnVzaW5lc3Mtem9uZQ==.1",
              "value": 200
            }, {
              "id": "cHJvamVjdEIuYnVzaW5lc3Mtem9uZQ==.1-bG9jYWxob3N0Oi0x.0",
              "value": 412
            }, {
              "id": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1-bG9jYWxob3N0Ojg3NjE=.0",
              "value": 3
            }]
          },
          "latencyC": {
            "values": [{
              "id": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1-d3d3LmJhaWR1LmNvbTo4MA==.0",
              "value": 32
            }, {
              "id": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1-MTkyLjE2OC4yNTIuMTI6ODc2MQ==.0",
              "value": 1
            }, {
              "id": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1-bG9jYWxob3N0Ojg3NjE=.0",
              "value": 1
            }, {
              "id": "cHJvamVjdEIuYnVzaW5lc3Mtem9uZQ==.1-MTkyLjE2OC4yNTIuMTI6ODc2MQ==.0",
              "value": 1
            }, {
              "id": "cHJvamVjdEIuYnVzaW5lc3Mtem9uZQ==.1-bG9jYWxob3N0Ojg3NjE=.0",
              "value": 1
            }, {
              "id": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1-MTI3LjAuMC4xOjkwOTI=.0",
              "value": 3403
            }, {
              "id": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1-MTkyLjE2OC4yNTIuMTI6ODc2MQ==.0",
              "value": 1
            }, {
              "id": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1-cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1",
              "value": 1293
            }, {
              "id": "bG9hZCBiYWxhbmNlcjEuc3lzdGVt.1-bG9hZCBiYWxhbmNlcjIuc3lzdGVt.1",
              "value": 1896
            }, {
              "id": "bG9hZCBiYWxhbmNlcjIuc3lzdGVt.1-cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1",
              "value": 1891
            }, {
              "id": "cHJvamVjdEEuYnVzaW5lc3Mtem9uZQ==.1-cHJvamVjdEIuYnVzaW5lc3Mtem9uZQ==.1",
              "value": 511
            }, {
              "id": "cHJvamVjdEIuYnVzaW5lc3Mtem9uZQ==.1-bG9jYWxob3N0Oi0x.0",
              "value": 4
            }, {
              "id": "cHJvamVjdEMuYnVzaW5lc3Mtem9uZQ==.1-bG9jYWxob3N0Ojg3NjE=.0",
              "value": 1
            }]
          }
        }
      };
      const resInfo = info.data;
      if (!resInfo.sla) {
        return context.commit(types.SET_TOPO, { calls, nodes });
      }
      // 填充节点的监控信息：sla、cpm、latency
      for (let i = 0; i < resInfo.sla.values.length; i += 1) {
        for (let j = 0; j < nodes.length; j += 1) {
          if (nodes[j].id === resInfo.sla.values[i].id) {
            nodes[j] = {
              ...nodes[j],
              // @ts-ignore
              isGroupActive: true,
              sla: resInfo.sla.values[i].value ? resInfo.sla.values[i].value / 100 : -1,
              cpm: resInfo.nodeCpm.values[i] ? resInfo.nodeCpm.values[i].value : -1,
              latency: resInfo.nodeLatency.values[i] ? resInfo.nodeLatency.values[i].value : -1,
            };
          }
        }
      }
      if (!resInfo.cpmC) {
        return context.commit(types.SET_TOPO, { calls, nodes });
      }
      // 填充idsC链路的监控信息：cpm、latency
      for (let i = 0; i < resInfo.cpmC.values.length; i += 1) {
        for (let j = 0; j < calls.length; j += 1) {
          if (calls[j].id === resInfo.cpmC.values[i].id) {
            calls[j] = {
              ...calls[j],
              // @ts-ignore
              isGroupActive: true,
              cpm: resInfo.cpmC.values[i] ? resInfo.cpmC.values[i].value : '',
              latency: resInfo.latencyC.values[i] ? resInfo.latencyC.values[i].value : '',
            };
          }
        }
      }
      if (!resInfo.cpmS) {
        return context.commit(types.SET_TOPO, { calls, nodes });
      }
      // 填充idsS链路的监控信息：cpm、latency
      for (let i = 0; i < resInfo.cpmS.values.length; i += 1) {
        for (let j = 0; j < calls.length; j += 1) {
          if (calls[j].id === resInfo.cpmS.values[i].id) {
            calls[j] = {
              ...calls[j],
              // @ts-ignore
              cpm: resInfo.cpmS.values[i] ? resInfo.cpmS.values[i].value : '',
              latency: resInfo.latencyS.values[i] ? resInfo.latencyS.values[i].value : '',
            };
          }
        }
      }
      context.commit(types.SET_TOPO, { calls, nodes });
    });
  },
  // todo sync
  GET_ALL_ENDPOINT_DEPENDENCY(
    context: { commit: Commit; state: State; dispatch: Dispatch },
    params: { endpointIds: string[]; duration: Duration },
  ) {
    context.dispatch('GET_ENDPOINT_TOPO', params).then((res) => {
      if (context.state.currentEndpointDepth.key > 1) {
        const endpointIds = res.nodes.map((item: Node) => item.id);

        context.dispatch('GET_ENDPOINT_TOPO', { endpointIds, duration: params.duration }).then((json) => {
          if (context.state.currentEndpointDepth.key > 2) {
            const ids = json.nodes.map((item: Node) => item.id);

            context.dispatch('GET_ENDPOINT_TOPO', { endpointIds: ids, duration: params.duration }).then((topo) => {
              if (context.state.currentEndpointDepth.key > 3) {
                const endpoints = topo.nodes.map((item: Node) => item.id);
                context
                  .dispatch('GET_ENDPOINT_TOPO', { endpointIds: endpoints, duration: params.duration })
                  .then((data) => {
                    if (context.state.currentEndpointDepth.key > 4) {
                      context
                        .dispatch('GET_ENDPOINT_TOPO', { endpointIds: endpoints, duration: params.duration })
                        .then((topos) => {
                          context.commit(types.SET_ENDPOINT_DEPENDENCY, topos);
                        });
                    } else {
                      context.commit(types.SET_ENDPOINT_DEPENDENCY, data);
                    }
                  });
              } else {
                context.commit(types.SET_ENDPOINT_DEPENDENCY, topo);
              }
            });
          } else {
            context.commit(types.SET_ENDPOINT_DEPENDENCY, json);
          }
        });
      } else {
        context.commit(types.SET_ENDPOINT_DEPENDENCY, res);
      }
    });
  },
  GET_ENDPOINT_TOPO(context: { commit: Commit; state: State }, params: { endpointIds: string[]; duration: Duration }) {
    const variables = ['$duration: Duration!'];
    const fragment = params.endpointIds.map((id: string, index: number) => {
      return `endpointTopology${index}: getEndpointDependencies(endpointId: "${id}", duration: $duration) {
        nodes {
          id
          name
          serviceId
          serviceName
          type
          isReal
        }
        calls {
          id
          source
          target
          detectPoints
        }
      }`;
    });
    const querys = `query queryData(${variables}) {${fragment}}`;
    return axios
      .post('/graphql', { query: querys, variables: { duration: params.duration } }, { cancelToken: cancelToken() })
      .then((res: AxiosResponse) => {
        if (res.data.errors) {
          context.commit(types.SET_ENDPOINT_DEPENDENCY, { calls: [], nodes: [] });
          return;
        }
        const topo = res.data.data;
        const calls = [] as any;
        let nodes = [] as any;
        for (const key of Object.keys(topo)) {
          calls.push(...topo[key].calls);
          nodes.push(...topo[key].nodes);
        }
        const obj = {} as any;
        nodes = nodes.reduce((prev: Node[], next: Node) => {
          if (!obj[next.id]) {
            obj[next.id] = true;
            prev.push(next);
          }
          return prev;
        }, []);
        const queryVariables = ['$duration: Duration!'];
        const fragments = calls
          .map((call: Call & EndpointDependencyConidition, index: number) => {
            let source = {} as any;
            let target = {} as any;
            for (const node of nodes) {
              if (node.id === call.source) {
                source = node;
                call.serviceName = node.serviceName;
                call.endpointName = node.name;
              }
              if (node.id === call.target) {
                target = node;
                call.destServiceName = node.serviceName;
                call.destEndpointName = node.name;
              }
            }
            return `cpm_${index}: readMetricsValue(condition: {
            name: "endpoint_relation_cpm"
            entity: {
              scope: EndpointRelation
              serviceName: "${source.serviceName}"
              normal: true
              endpointName: "${source.name}"
              destNormal: true
              destServiceName: "${target.serviceName}"
              destEndpointName: "${target.name}"
            }
          }, duration: $duration)`;
          })
          .join(' ');
        const query = `query queryData(${queryVariables}) {${fragments}}`;
        return axios
          .post('/graphql', { query, variables: { duration: params.duration } }, { cancelToken: cancelToken() })
          .then((json: AxiosResponse<any>) => {
            if (json.data.errors) {
              context.commit(types.SET_ENDPOINT_DEPENDENCY, { calls: [], nodes: [] });
              return;
            }
            const cpms = json.data.data;
            const keys = Object.keys(cpms);
            for (const key of keys) {
              const index = Number(key.split('_')[1]);
              calls[index].value = cpms[key] || 0.01;
            }
            return { calls, nodes };
          })
          .catch(() => {
            context.commit(types.SET_ENDPOINT_DEPENDENCY, { calls: [], nodes: [] });
          });
      });
  },
  async GET_TOPO_INSTANCE_DEPENDENCY(
    context: { commit: Commit; state: State },
    params: {
      clientServiceId: string;
      serverServiceId: string;
      duration: Duration;
    },
  ) {
    graph
      .query('queryTopoInstanceDependency')
      .params(params)
      .then((res: AxiosResponse) => {
        if (!(res.data && res.data.data)) {
          return;
        }
        const serverIdsC = [] as string[];
        const clientIdsC = [] as string[];
        const topoCalls = res.data.data.topo.calls;
        for (const call of topoCalls) {
          if (call.detectPoints.includes('CLIENT')) {
            clientIdsC.push(call.id);
          } else {
            serverIdsC.push(call.id);
          }
        }
        graph
          .query('queryDependencyInstanceClientMetric')
          .params({
            idsC: clientIdsC,
            duration: params.duration,
          })
          .then((json: AxiosResponse) => {
            const clientCalls = [] as string[];
            for (const call of topoCalls) {
              for (const cpm of json.data.data.cpmC.values) {
                if (cpm.id === call.id) {
                  clientCalls.push({
                    ...call,
                    ...cpm,
                  });
                }
              }
            }
            graph
              .query('queryDependencyInstanceServerMetric')
              .params({
                idsC: serverIdsC,
                duration: params.duration,
              })
              .then((jsonResp: AxiosResponse) => {
                const serverCalls = [] as string[];
                for (const call of topoCalls) {
                  for (const cpm of jsonResp.data.data.cpmC.values) {
                    if (cpm.id === call.id) {
                      serverCalls.push({
                        ...call,
                        ...cpm,
                      });
                    }
                  }
                }
                const data = {
                  nodes: res.data.data.topo.nodes,
                  calls: [...serverCalls, ...clientCalls],
                };
                context.commit(types.SET_INSTANCE_DEPENDENCY, data);
              });
          });
      });
  },
  INSTANCE_RELATION_INFO(
    context: { commit: Commit; state: State },
    params: Call & { mode: string; queryType: string; durationTime: Duration },
  ) {
    graph
      .query(params.queryType)
      .params({
        id: params.id,
        duration: params.durationTime,
      })
      .then((res: AxiosResponse) => {
        if (!(res.data && res.data.data)) {
          return;
        }
        context.commit(types.SET_SELECTED_INSTANCE_CALL, params);
        context.commit(types.SET_INSTANCE_DEPEDENCE_TYPE, params.mode);
        context.commit(types.SET_INSTANCE_DEPEDENCE_METRICS, res.data.data);
      });
  },
  GET_ENDPOINT_DEPENDENCY_METRICS(context: { commit: Commit; state: State }, params: EndpointDependencyConidition) {
    return graph
      .query('queryTopoEndpointDependencyMetrics')
      .params(params)
      .then((res: AxiosResponse) => {
        if (!(res.data && res.data.data)) {
          return;
        }
        context.commit(types.SET_ENDPOINT_DEPENDENCY_METRICS, res.data.data);
      });
  },
};

export default {
  namespaced: true,
  state: initState,
  getters,
  actions,
  mutations,
};
