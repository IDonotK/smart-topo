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
    return axios
      .get(`${window.location.origin}/v1/scene-config`, {
        params,
      })
      .then((res: any) => {
        if (res && res.data && res.data.sceneConfig) {
          context.commit(types.SET_SCENE_CONFIG, res.data.sceneConfig);
        }
        return res.data.sceneConfig;
      })
      .catch(err => {});
  },
  GET_EVENTS_DATA(context: { commit: Commit; state: State }, params: any) {
    return axios
      .post(`${window.location.origin}/v1/events`, params, {
        cancelToken: cancelToken(),
      })
      .then((res: any) => {
        if (res && res.data && res.data.events) {
          res.data.events.forEach(item => {
            item.expansion = false;
            item.createTime = utc2Peking(item.createTime);
            item.updateTime = utc2Peking(item.updateTime);
          });
        }
        return res.data;
      })
      .catch(err => {});
  },
  GET_RELYON_DATA(context: { commit: Commit; state: State }, params: any) {
    return axios
      .get(`${window.location.origin}/v1/underlying-resources`, {
        params,
        cancelToken: cancelToken(),
      })
      .then((res: any) => {
        let relyonData = formatTopoData(res, true);
        return relyonData;
      })
      .catch(err => {});
  },
  GET_RELATIVE_DATA(context: { commit: Commit; state: State }, params: any) {
    return axios
      .get(`${window.location.origin}/v1/linked-endpoints`, {
        params,
        cancelToken: cancelToken(),
      })
      .then((res: any) => {
        let relativeData = formatTopoData(res, false);
        return relativeData;
      })
      .catch(err => {});
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
    return axios
      .get(`${window.location.origin}/v1/endpoints`, {
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
      .catch(err => {
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
