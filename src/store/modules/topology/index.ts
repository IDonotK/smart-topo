import { Commit, ActionTree, Dispatch } from 'vuex';
import * as types from '../../mutation-types';
import axios, { AxiosPromise, AxiosResponse } from 'axios';
import { cancelToken } from '@/utils/cancelToken';
import { formatTopoData, utc2Peking } from '@/utils/topo';

import { getEvents } from './getEvents.js';
import { generateGesData } from './ges-data';
import { generateGesDataOnTime } from './ges-data-times';
import { getA1Up, getA1Down, getA1Cl, getA2Up, getA2Down, getA2Cl } from './relative-data';
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
  zoomController: any;
  showRelativeTypes: any[];
  topoScaleFix: number;
  isFirstTick: boolean;
  isTopoNodesUpdated: boolean;
  isTopoLinksUpdated: boolean;
  topoMode: string;
  exploreNode: any;
  topoData: any;
  toolSetInstance: any;
  topoTimeInstance: any;
  networkInstance: any;
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
  zoomController: null,
  showRelativeTypes: [],
  topoScaleFix: -1,
  isFirstTick: true,
  isTopoNodesUpdated: false,
  isTopoLinksUpdated: false,
  topoMode: 'global',
  exploreNode: {},
  topoData: {
    nodes: [],
    links: [],
  },
  toolSetInstance: {},
  topoTimeInstance: {},
  networkInstance: {},
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
  [types.SET_ZOOM_CONTROLLER](state: State, data: any) {
    state.zoomController = data;
  },
  [types.SET_SHOW_RELATIVE_TYPES](state: State, data: any) {
    state.showRelativeTypes = data;
  },
  [types.SET_TOPO_SCALE_FIX](state: State, data: any) {
    state.topoScaleFix = data;
  },
  [types.SET_IS_TOPO_NODES_UPDATED](state: State, data: any) {
    state.isTopoNodesUpdated = data;
  },
  [types.SET_IS_TOPO_LINKS_UPDATED](state: State, data: any) {
    state.isTopoLinksUpdated = data;
  },
  [types.SET_IS_FIRST_TICK](state: State, data: any) {
    state.isFirstTick = data;
  },
  [types.SET_TOPO_MODE](state: State, data: any) {
    state.topoMode = data;
  },
  [types.SET_EXPLORE_NODE](state: State, data: any) {
    state.exploreNode = data;
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
  [types.SET_NETWORK_INSTANCE](state: State, data: any) {
    state.networkInstance = data;
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
    return axios
      .get(window.location.origin + '/v1/scene-config', {
        params,
        cancelToken: cancelToken(),
      })
      .then((res: any) => {
        if (res && res.data && res.data.sceneConfig) {
          context.commit(types.SET_SCENE_CONFIG, res.data.sceneConfig);
        }
        return res.data.sceneConfig;
      })
      .catch((err) => {});
  },
  GET_EVENTS_DATA(context: { commit: Commit; state: State }, params: any) {
    return axios
      .post(window.location.origin + '/v1/events', params, {
        cancelToken: cancelToken(),
      })
      .then((res: any) => {
        if (res && res.data && res.data.events) {
          res.data.events.forEach((item) => {
            item.expansion = false;
            item.createTime = utc2Peking(item.createTime);
            item.updateTime = utc2Peking(item.updateTime);
          });
        }
        return res.data;
      })
      .catch((err) => {});
    // return Promise.resolve().then((res) => {
    //     const eventsDataRes = getEvents();
    //     if (eventsDataRes && eventsDataRes.data && eventsDataRes.data.events) {
    //       eventsDataRes.data.events.forEach(item => {
    //         item.expansion = false;
    //         item.createTime = utc2Peking(item.createTime);
    //         item.updateTime = utc2Peking(item.updateTime);
    //       })
    //     }
    //     return eventsDataRes.data;
    // });
  },
  GET_RELYON_DATA(context: { commit: Commit; state: State }, params: any) {
    return Promise.resolve().then(() => {
      // let relyonData = formatTopoData(getA1Cl(), true);
      let relyonData = formatTopoData(getA2Cl(), true);
      return relyonData;
    });
    // return axios.get( window.location.origin + '/v1/underlying-resources', {
    //     params,
    //     cancelToken: cancelToken()
    //   })
    //   .then((res: any) => {
    //     // let relyonData = formatTopoData(res, true);
    //     let relyonData = formatTopoData(getA1Cl(), true);
    //     return relyonData;
    //   })
    //   .catch((err) => {});
  },
  GET_RELATIVE_DATA(context: { commit: Commit; state: State }, params: any) {
    return Promise.resolve().then(() => {
      let relativeData = {
        nodes: [],
        links: [],
      };
      if (params.direction == 'in') {
        // relativeData = formatTopoData(getA1Up(), true);
        relativeData = formatTopoData(getA2Up(), true);
      } else {
        // relativeData = formatTopoData(getA1Down(), true);
        relativeData = formatTopoData(getA2Down(), true);
      }
      return relativeData;
    });
    // return axios.get( window.location.origin + '/v1/applications', {
    //     params,
    //     cancelToken: cancelToken()
    //   })
    //   .then((res: any) => {
    //     // let relativeData = formatTopoData(res, false);
    //     let relativeData = {
    //       nodes: [],
    //       links: [],
    //     };
    //     if (params.direction == 'in') {
    //       relativeData = formatTopoData(getA1Up(), true);
    //     } else {
    //       relativeData = formatTopoData(getA1Down(), true);
    //     }
    //     return relativeData;
    //   })
    //   .catch((err) => {});
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
    return new Promise((resolve, reject) => {
      // setTimeout(() => {
      //   resolve(1);
      // }, 2000);
      resolve(1);
    }).then(() => {
      context.state.isLoadingTopo = false;
      let topoData = formatTopoData(generateGesData(), true);
      // timeIndex++;
      // if (timeIndex > 8) {
      //   timeIndex = 1;
      // }
      // let topoData = formatTopoData(generateGesDataOnTime(timeIndex), true);
      context.commit(types.SET_TOPO_DATA, {
        nodes: topoData.nodes,
        links: topoData.links,
      });
    });
    // return axios
    //   .get(window.location.origin + '/v1/endpoints', {
    //     params,
    //     cancelToken: cancelToken(),
    //   })
    //   .then((res: any) => {
    //     context.state.isLoadingTopo = false;
    //     // let topoData = formatTopoData(res, true);
    //     let topoData = formatTopoData(generateGesData(), true);
    //     context.commit(types.SET_TOPO_DATA, {
    //       nodes: topoData.nodes,
    //       links: topoData.links,
    //     });
    //   })
    //   .catch((err) => {
    //     context.state.isLoadingTopo = false;
    //   });
  },
};

export default {
  namespaced: true,
  state: initState,
  getters,
  actions,
  mutations,
};
