import { Commit, ActionTree, Dispatch } from 'vuex';
import * as types from '../../mutation-types';
import axios, { AxiosPromise, AxiosResponse } from 'axios';
import { cancelToken } from '@/utils/cancelToken';
import { formatTopoData, utc2Peking } from '@/utils/topo';

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
  },
  GET_RELYON_DATA(context: { commit: Commit; state: State }, params: any) {
    return axios
      .get(window.location.origin + '/v1/underlying-resources', {
        params,
        cancelToken: cancelToken(),
      })
      .then((res: any) => {
        let relyonData = formatTopoData(res, true);
        return relyonData;
      })
      .catch((err) => {});
  },
  GET_RELATIVE_DATA(context: { commit: Commit; state: State }, params: any) {
    return axios
      .get(window.location.origin + '/v1/applications', {
        params,
        cancelToken: cancelToken(),
      })
      .then((res: any) => {
        let relativeData = formatTopoData(res, false);
        return relativeData;
      })
      .catch((err) => {});
  },
  GET_TOPO_DATA(context: { commit: Commit; state: State }, params: any) {
    context.state.isLoadingTopo = true;
    context.commit(types.SET_TOPO_DATA, {
      nodes: [],
      links: [],
    });
    return axios
      .get(window.location.origin + '/v2/endpoints', {
        params,
        cancelToken: cancelToken(),
      })
      .then((res: any) => {
        context.state.isLoadingTopo = false;
        let topoData = formatTopoData(res, true);
        context.commit(types.SET_TOPO_DATA, {
          nodes: topoData.nodes,
          links: topoData.links,
        });
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          context.state.isLoadingTopo = false;
        }
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