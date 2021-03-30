/* eslint-disable max-lines-per-function */
/* eslint-disable no-param-reassign */
import { Commit, ActionTree, Dispatch } from 'vuex';
import * as types from '../../mutation-types';
import axios, { AxiosPromise, AxiosResponse } from 'axios';
import { cancelToken } from '@/utils/cancelToken';
import { formatTopoData, utc2Peking } from '@/utils/topo';

import { getEvents } from './get-events.js';
import { generateGesData } from './ges-data';
import { getA1Up, getA1Down, getA1Cl, getA1Both, getM1Up, getM1Down, getM1Both, getM1Cl } from './relative-data';
let timeIndex = 0;

export interface Duration {
  start: string;
  end: string;
  step: string;
}

export interface State {
  currentNode: any;
  curNodeCrossLayer: any;
  viewNode: any;
  topoInstances: any[];
  showNodeTypes: any[];
  showStateTypes: any[];
  showEdgeTypes: any[];
  showRelativeTypes: any[];
  topoMode: string;
  exploreNode: any;
  layeredExploreNode: any,
  quickExploreNode: any;
  topoData: any;
  toolSetInstance: any;
  topoTimeInstance: any;
  networkInstanceMainTopo: any;
  networkInstanceRelativeTopo: any;
  elemIdsRTCAll: any;
  topoDetailData: any;
  isAutoReloadTopo: boolean;
  isLoadingTopo: boolean;
  sceneConfig: any;
}

const initState: State = {
  currentNode: {},
  curNodeCrossLayer: {},
  viewNode: {},
  showNodeTypes: [],
  showStateTypes: [],
  showEdgeTypes: [],
  showRelativeTypes: [],
  topoMode: 'global',
  exploreNode: {},
  layeredExploreNode: {},
  quickExploreNode: {},
  topoData: {
    nodes: [],
    links: [],
  },
  toolSetInstance: {},
  topoTimeInstance: {},
  networkInstanceMainTopo: {},
  networkInstanceRelativeTopo: {},
  elemIdsRTCAll: {
    nodeIds: [],
    linkIds: [],
  },
  topoDetailData: {
    nodes: [],
    links: [],
  },
  isAutoReloadTopo: false,
  topoInstances: [],
  isLoadingTopo: false,
  sceneConfig: {},
};

// getters
const getters = {};

// mutations
const mutations = {
  [types.SET_NODE](state: State, data: any) {
    state.currentNode = data;
  },
  [types.SET_NODE_CROSS_LAYER](state: State, data: any) {
    state.curNodeCrossLayer = data;
  },
  [types.SET_VIEW_NODE](state: State, data: any) {
    state.viewNode = data;
  },
  [types.SET_SHOW_NODE_TYPES](state: State, data: any) {
    state.showNodeTypes = data;
  },
  [types.SET_SHOW_STATE_TYPES](state: State, data: any) {
    state.showStateTypes = data;
  },
  [types.SET_SHOW_EDGE_TYPES](state: State, data: any) {
    state.showEdgeTypes = data;
  },
  [types.SET_SHOW_RELATIVE_TYPES](state: State, data: any) {
    state.showRelativeTypes = data;
  },
  [types.SET_TOPO_MODE](state: State, data: any) {
    state.topoMode = data;
  },
  [types.SET_EXPLORE_NODE](state: State, data: any) {
    state.exploreNode = data;
  },
  [types.SET_LAYERED_EXPLORE_NODE](state: State, data: any) {
    state.layeredExploreNode = data;
  },
  [types.SET_QUICK_EXPLORE_NODE](state: State, data: any) {
    state.quickExploreNode = data;
  },
  [types.SET_TOPO_DATA](state: State, data: any) {
    state.topoData = data;
  },
  [types.SET_TOOL_SET_INSTANCE](state: State, data: any) {
    state.toolSetInstance = data;
  },
  [types.SET_TOPO_TIME_INSTANCE](state: State, data: any) {
    state.topoTimeInstance = data;
  },
  [types.SET_NETWORK_INSTANCE_MAIN_TOPO](state: State, data: any) {
    state.networkInstanceMainTopo = data;
  },
  [types.SET_NETWORK_INSTANCE_RELATIVE_TOPO](state: State, data: any) {
    state.networkInstanceRelativeTopo = data;
  },
  [types.SET_ELEM_IDS_RTC_ALL](state: State, data: any) {
    state.elemIdsRTCAll = data;
  },
  [types.SET_TOPO_DETAIL_DATA](state: State, data: any) {
    state.topoDetailData = data;
  },
  [types.SET_IS_AUTO_RELOAD_TOPO](state: State, data: any) {
    state.isAutoReloadTopo = data;
  },
  [types.SET_TOPO_INSTANCE](state: State, data: any[]) {
    state.topoInstances = data;
    window.localStorage.setItem('topologyInstances', JSON.stringify(data));
  },
  [types.SET_IS_LOADING_TOPO](state: State, data: any) {
    state.isLoadingTopo = data;
  },
  [types.SET_SCENE_CONFIG](state: State, data: any) {
    state.sceneConfig = data;
  },
};

// actions
const actions: ActionTree<State, any> = {
  GET_SCENE_CONFIG(context: { commit: Commit; state: State }, params: any) {
    context.commit(types.SET_SCENE_CONFIG, {});
    return Promise.resolve().then(res => {
      // @ts-ignore
      res = {
        data: {
          sceneConfig: {
            agentMode: 'customised',
            eventSource: 'k8s,aom',
          },
        },
      };
      // @ts-ignore
      if (res && res.data && res.data.sceneConfig) {
        // @ts-ignore
        context.commit(types.SET_SCENE_CONFIG, res.data.sceneConfig);
      }
      // @ts-ignore
      return res.data.sceneConfig;
    });
  },
  GET_EVENTS_DATA(context: { commit: Commit; state: State }, params: any) {
    return Promise.resolve().then(res => {
      const eventsDataRes = getEvents();
      if (eventsDataRes && eventsDataRes.data && eventsDataRes.data.events) {
        eventsDataRes.data.events.forEach(item => {
          item.expansion = false;
          item.createTime = utc2Peking(item.createTime);
          item.updateTime = utc2Peking(item.updateTime);
        });
      }
      return eventsDataRes.data;
    });
  },
  GET_RELYON_DATA(context: { commit: Commit; state: State }, params: any) {
    return Promise.resolve().then(() => {
      let relyonData;
      if (params.id === 'm1') {
        relyonData = formatTopoData(getM1Cl(), true);
      } else {
        relyonData = formatTopoData(getA1Cl(), true);
      }
      return relyonData;
    });
  },
  GET_RELATIVE_DATA(context: { commit: Commit; state: State }, params: any) {
    return axios
      .get(`${window.location.origin}/v1/linked-endpoints`, {
        params,
        cancelToken: cancelToken(),
      })
      .then((res: any) => {
        let relativeData = {
          nodes: [],
          links: [],
        };
        if (params.direction === 'in') {
          if (params.id === 'm1') {
            relativeData = formatTopoData(getM1Up(), true);
          } else {
            relativeData = formatTopoData(getA1Up(), true);
          }
          // relativeData = formatTopoData(getA2Up(), true);
        } else if (params.direction === 'out') {
          if (params.id === 'm1') {
            relativeData = formatTopoData(getM1Down(), true);
          } else {
            relativeData = formatTopoData(getA1Down(), true);
          }
          // relativeData = formatTopoData(getA2Down(), true);
        } else {
          if (params.id === 'm1') {
            relativeData = formatTopoData(getM1Both(), true);
          } else {
            relativeData = formatTopoData(getA1Both(), true);
          }
        }
        return relativeData;
      })
      .catch(err => {});

    // return Promise.resolve().then(() => {
    //   let relativeData = {
    //     nodes: [],
    //     links: [],
    //   };
    //   if (params.direction === 'in') {
    //     if (params.id === 'm1') {
    //       relativeData = formatTopoData(getM1Up(), true);
    //     } else {
    //       relativeData = formatTopoData(getA1Up(), true);
    //     }
    //     // relativeData = formatTopoData(getA2Up(), true);
    //   } else if (params.direction === 'out') {
    //     if (params.id === 'm1') {
    //       relativeData = formatTopoData(getM1Down(), true);
    //     } else {
    //       relativeData = formatTopoData(getA1Down(), true);
    //     }
    //     // relativeData = formatTopoData(getA2Down(), true);
    //   } else {
    //     if (params.id === 'm1') {
    //       relativeData = formatTopoData(getM1Both(), true);
    //     } else {
    //       relativeData = formatTopoData(getA1Both(), true);
    //     }
    //   }
    //   return relativeData;
    // });
  },
  GET_TOPO_DATA(context: { commit: Commit; state: State }, params: any) {
    if (params.isClearTopoData) {
      context.state.isLoadingTopo = true;
      context.commit(types.SET_TOPO_DATA, {
        nodes: [],
        links: [],
      });
    } else {
      context.state.isLoadingTopo = false;
    }
    return Promise.resolve().then(() => {
      context.state.isLoadingTopo = false;
      let topoData = formatTopoData(generateGesData(), true);
      // let topoData = formatTopoData(getTypes(), true);
      context.commit(types.SET_TOPO_DATA, {
        nodes: topoData.nodes,
        links: topoData.links,
      });
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
