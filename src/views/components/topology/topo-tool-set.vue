<template>
  <div class="topo-tool-set">
    <!-- 拓扑探索 -->
    <div class="explore-topo-wrapper">
      <svg v-show="topoMode !== 'global'" class="icon topo-icon back" @click="handleClickExploreBtnBack">
        <use xlink:href="#BACK"></use>
        <title>{{ $t('topoToolSet_explore_node_back') }}</title>
      </svg>
      <svg class="icon topo-icon explore" @click="handleClickExploreBtn">
        <use xlink:href="#EXPLORE"></use>
        <title>{{ $t('topoToolSet_explore_node_title') }}</title>
      </svg>
      <!-- 返回探索全部节点 -->
      <el-dialog
        class="explore-dialog back"
        :title="$t('topoToolSet_explore_node_back_tip')"
        :visible.sync="isShowExploreBack"
        width="30%"
      >
        <template v-slot:footer class="dialog-footer">
          <el-button @click="isShowExploreBack = false">{{ $t('cancel') }}</el-button>
          <el-button type="primary" @click="handleConfirmExploreBack">{{ $t('confirm') }}</el-button>
        </template>
      </el-dialog>
      <!-- 探索目标节点 -->
      <el-dialog
        class="explore-dialog"
        :title="$t('topoToolSet_explore_node_title')"
        :visible.sync="isShowExplore"
        width="30%"
        @close="onCloseExploreDialog"
      >
        <div class="modes-wrapper">
          <div class="mw-item">
            <el-radio v-model="exploreItem" label="specific" class="specific-radio">{{
              $t('topoToolSet_explore_mode_specific')
            }}</el-radio>
            <el-form ref="specificForm" :model="specificForm" status-icon :rules="specificRules">
              <el-form-item prop="specificId">
                <el-autocomplete
                  ref="mwAutocomplete"
                  v-model="specificForm.specificId"
                  popper-class="mw-autocomplete"
                  :placeholder="$t('topoToolSet_explore_search_placeholder')"
                  value-key="id"
                  :select-when-unmatched="true"
                  :disabled="exploreItem === 'global'"
                  :fetch-suggestions="queryExplore"
                  @select="handleExploreOnId"
                >
                  <template v-slot="{ item }">
                    <span :title="item.id">{{ item.id }}</span>
                  </template>
                </el-autocomplete>
              </el-form-item>
            </el-form>
          </div>
          <div class="mw-item">
            <el-radio v-model="exploreItem" label="global">{{ $t('topoToolSet_explore_mode_global') }}</el-radio>
          </div>
        </div>
        <template v-slot:footer class="dialog-footer">
          <el-button @click="isShowExplore = false">{{ $t('cancel') }}</el-button>
          <el-button type="primary" @click="handleConfirmExplore">{{ $t('confirm') }}</el-button>
        </template>
      </el-dialog>
    </div>
    <!-- 搜索节点 -->
    <div class="search-wrapper">
      <el-autocomplete
        ref="swAutocomplete"
        v-model="inputId"
        popper-class="sw-autocomplete"
        :placeholder="$t('topoToolSet_search_placeholder')"
        value-key="id"
        :clearable="true"
        :select-when-unmatched="true"
        :fetch-suggestions="querySearch"
        @focus="handleFocusInputId"
        @clear="handleClearInputId"
        @select="handleSearchOnId"
      >
        <template v-slot:prefix>
          <svg class="topo-icon" aria-hidden="true" @click="handleMouseUp">
            <use xlink:href="#SEARCH"></use>
          </svg>
        </template>
        <template v-slot="{ item }">
          <span :title="item.id">{{ item.id }}</span>
        </template>
      </el-autocomplete>
      <svg v-show="topoMode === 'global'" class="topo-icon erase" aria-hidden="true" @click="handleEraseTopo">
        <use xlink:href="#ERASE"></use>
        <title>{{ $t('topoToolSet_topoCtrl_erase') }}</title>
      </svg>
    </div>
    <!-- 缩放控制 -->
    <div class="size-controller">
      <svg class="topo-icon larger" aria-hidden="true" @click="handleEnlargeTopo">
        <use xlink:href="#ENLARGE"></use>
        <title>{{ $t('topoToolSet_topoCtrl_enlarge') }}</title>
      </svg>
      <svg class="topo-icon smaller" aria-hidden="true" @click="handleNarrowTopo">
        <use xlink:href="#NARROW"></use>
        <title>{{ $t('topoToolSet_topoCtrl_narrow') }}</title>
      </svg>
      <svg class="topo-icon restore" aria-hidden="true" @click.stop.prevent="handleRestoreTopo">
        <use xlink:href="#RESTORE"></use>
        <title>{{ $t('topoToolSet_topoCtrl_restore') }}</title>
      </svg>
    </div>
    <!-- 过滤器 -->
    <div ref="toolFilters" class="tool-filters">
      <div class="tb-item node-types-filter">
        <div
          v-for="(item, index) in nodeTypesOption.data"
          :key="index"
          :class="{ 'ntf-item': true, unchecked: !item.checked }"
        >
          <span class="item-wrapper item-checkbox">
            <input v-model="item.checked" type="checkbox" @change="toggleNodeTypeChecked" />
          </span>
          <span class="item-wrapper item-icon" :title="item.label">
            <svg><use :xlink:href="'#' + item.label.toUpperCase()"></use></svg>
          </span>
        </div>
      </div>
      <div class="tb-item state-types-filter">
        <div
          v-for="(item, index) in stateTypesOption.data"
          :key="index"
          :class="{ 'stf-item': true, unchecked: !item.checked }"
        >
          <span class="item-wrapper item-checkbox">
            <input v-model="item.checked" type="checkbox" @change="toggleStateTypeChecked" />
          </span>
          <span class="item-wrapper item-title">{{ item.label }}</span>
        </div>
      </div>
      <div v-show="currentNode.id !== undefined" class="tb-item relative-types-filter">
        <div
          v-for="(item, index) in relativeTypesOption.data"
          :key="index"
          :class="{ 'rtf-item': true, unchecked: !item.checked }"
        >
          <span class="item-wrapper item-checkbox">
            <input v-model="item.checked" type="checkbox" @change="toggleRelativeTypeChecked" />
          </span>
          <span class="item-wrapper item-title">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="js">
import axios, { AxiosPromise, AxiosResponse } from 'axios';
import { cancelToken } from '@/utils/cancelToken';
import { dateFormat } from '@/utils/topo';

export default {
  props: {
    topoViewData: {
      type: Object,
      default() {
        return {
          nodes: [],
          links: [],
        };
      },
    },
  },

  data() {
    return {
      isShowExplore: false,
      isShowExploreBack: false,
      exploreItem: 'specific',
      specificForm: { specificId: '' },
      specificRules: {
        specificId: [ { validator: this.validateId, trigger: 'blur' } ],
      },
      exploreTypes: [],
      inputId: '',
      moreToolState: false,
      nodeTypesOption: {},
      stateTypesOption: {},
      relativeTypesOption: {},
      elemIdsRTCAll: {
        nodeIds: [],
        linkIds: []
      },
      elemIdsRTCUp: {
        nodeIds: [],
        linkIds: []
      },
      elemIdsRTCDown: {
        nodeIds: [],
        linkIds: []
      },
      elemsRTCAll: {
        nodes: [],
        links: []
      },
      elemsRTCUp: {
        nodes: [],
        links: []
      },
      elemsRTCDown: {
        nodes: [],
        links: []
      },
      tickTimer: null,
      topoIdNamespace: 'MainTopo',
    }
  },

  computed: {
    sceneConfig() {
      return this.$store.state.rocketTopo.sceneConfig;
    },
    isAutoReloadTopo() {
      return this.$store.state.rocketTopo.isAutoReloadTopo;
    },
    durationRow() {
      return this.$store.state.rocketbot.durationRow;
    },
    topoMode() {
      return this.$store.state.rocketTopo.topoMode;
    },
    currentNode() {
      return this.$store.state.rocketTopo.currentNode;
    },
    topoDetailData() {
      return this.$store.state.rocketTopo.topoDetailData;
    },
    networkInstanceMainTopo() {
      return this.$store.state.rocketTopo.networkInstanceMainTopo;
    },
    topoTimeInstance() {
      return this.$store.state.rocketTopo.topoTimeInstance;
    },
  },

  watch: {
    exploreItem(newVal) {
      this.$refs.specificForm.resetFields();
    },
    topoViewData(newVal) {
      this.setFiltersState(newVal);
      this.filterTopo();
    },
    inputId(newVal) {
      if (newVal === '') {
        this.$emit('onSearchResult', true);
      }
    },
    currentNode(newVal, oldVal) {
      this.restoreTopoDetailData();
      if (newVal.id === undefined) {
        this.filterTopo();
      } else {
        if (this.topoMode === 'global') {
          this.getRelativeElems(newVal, this.topoViewData, () => {
            this.networkInstanceMainTopo.setTopoViewport(newVal, oldVal, true);
            this.resetTopoDetailData(this.topoViewData, true);
            this.setFiltersState(this.elemsRTCAll);
            this.filterTopo();
          });
        } else {
          if (this.topoMode === 'specific-layered') {
            this.resetTopoDetailData(this.topoViewData, false);
          } else {
            this.networkInstanceMainTopo.setTopoViewport(newVal, oldVal, true);
            this.resetTopoDetailData(this.topoViewData, true);
            this.setFiltersState(this.elemsRTCAll);
            this.filterTopo();
          }
        }
      }
    },
  },

  mounted() {
    this.initFilterTypesOption();
    let nodeTypes = this.nodeTypesOption.data.filter(type => type.checked).map(type => type.label);
    let stateTypes = this.stateTypesOption.data.filter(type => type.checked).map(type => type.label);
    let relativeTypes = this.relativeTypesOption.data.filter(type => type.checked).map(type => type.label);
    this.$store.commit('rocketTopo/SET_SHOW_NODE_TYPES', nodeTypes);
    this.$store.commit('rocketTopo/SET_SHOW_STATE_TYPES', stateTypes);
    this.$store.commit('rocketTopo/SET_SHOW_RELATIVE_TYPES', relativeTypes);
    this.$store.commit('rocketTopo/SET_TOOL_SET_INSTANCE', this);
  },

  destroyed() {
    if (this.tickTimer) {
      clearTimeout(this.tickTimer);
      this.tickTimer = null;
    }
  },

  methods: {
    setFiltersState(data) {
      let nodeTypesSet = new Set();
      let stateTypesSet = new Set();
      data.nodes.forEach(node => {
        nodeTypesSet.add(node.type);
        stateTypesSet.add(node.state);
      });
      this.nodeTypesOption.data.forEach(option => {
        option.checked = !!nodeTypesSet.has(option.id);
      });
      this.stateTypesOption.data.forEach(option => {
        option.checked = !!stateTypesSet.has(option.id);
      });
    },
    initFilterTypesOption() {
      this.nodeTypesOption = {
        title: this.$t('topoSideInformation_topoInfo_node_type'),
        data: [
          {id: 'Application', label: 'Application', checked: true},
          {id: 'MiddleWare', label: 'MiddleWare', checked: true},
          {id: 'Process', label: 'Process', checked: true},
          {id: 'Pod', label: 'Pod', checked: true},
          {id: 'Node', label: 'Node', checked: true},
        ],
      };
      this.stateTypesOption = {
        title: this.$t('topoSideInformation_topoInfo_node_state'),
        data: [
          {id: 'Normal', label: this.$t('topoSideNavigation_nodesCount_normal'), checked: true},
          {id: 'Abnormal', label: this.$t('topoSideNavigation_nodesCount_abnormal'), checked: true},
        ],
      };
      this.relativeTypesOption = {
        title: this.$t('topoSideInformation_topoInfo_node_relation'),
        data: [
          {id: 'Upstream', label: this.$t('topoSideInformation_topoInfo_node_relation_up'), checked: true},
          {id: 'Downstream', label: this.$t('topoSideInformation_topoInfo_node_relation_down'), checked: true},
        ],
      };
    },
    validateId(rule, value, callback) {
      if (value === '') {
        callback(new Error(this.$t('topoToolSet_explore_search_check_null')));
      } else {
        let result = this.topoViewData.nodes.find(node => String(node.id) === value);
        if (result === undefined) {
          callback(new Error(this.$t('topoToolSet_explore_search_check_exist')));
        } else {
          callback();
        }
      }
    },
    onCloseExploreDialog() {
      this.$refs.mwAutocomplete.suggestions = [];
      this.$refs.specificForm.resetFields();
    },
    resetIsAutoReloadTopo() {
      if (this.networkInstanceMainTopo.simulation) {
        this.networkInstanceMainTopo.simulation.stop();
      }
      if (this.isAutoReloadTopo) {
        this.$store.commit('rocketTopo/SET_IS_AUTO_RELOAD_TOPO', false);
      }
    },
    restoreTopoDetailData() {
      this.$store.commit('rocketTopo/SET_TOPO_DETAIL_DATA', {nodes: [], links: []});
    },
    restoreElemsRTC() {
      this.$store.commit('rocketTopo/SET_ELEM_IDS_RTC_ALL', {nodeIds: [], linkIds: []});
      this.elemIdsRTCUp = {
        nodeIds: [],
        linkIds: []
      };
      this.elemIdsRTCDown = {
        nodeIds: [],
        linkIds: []
      };
      this.elemIdsRTCAll = {
        nodeIds: [],
        linkIds: []
      };

      this.elemsRTCUp = {
        nodes: [],
        links: []
      };
      this.elemsRTCDown = {
        nodes: [],
        links: []
      };
      this.elemsRTCAll = {
        nodes: [],
        links: []
      };
    },
    searchStreamOnSingleHop(curNode, rtcData, nodeSet, linkSet) {
      const nodesTmpUp = new Set();
      const linksTmpUp = new Set();
      const nodesTmpDown = new Set();
      const linksTmpDown = new Set();
      rtcData.links.forEach(link => {
        if (link.tid === curNode.id && link.source.type === curNode.type) {
          linksTmpUp.add(link);
          nodesTmpUp.add(link.source);

          linkSet.add(link);
          nodeSet.add(link.source);
        }
        if (link.sid === curNode.id && link.target.type === curNode.type) {
          linksTmpDown.add(link);
          nodesTmpDown.add(link.target);

          linkSet.add(link);
          nodeSet.add(link.target);
        }
      });
      const nodesTmp = new Set([...nodesTmpUp, ...nodesTmpDown]);
      const linksTmp = new Set([...linksTmpUp, ...linksTmpDown]);
    },
    queryCrosslayerNodes(curNode) {
      const params = {
        id: curNode.id,
        start_time: dateFormat('YYYY-mm-dd HH:MM:SS', this.durationRow.start),
        end_time: dateFormat('YYYY-mm-dd HH:MM:SS', this.durationRow.end),
      };
      let res = this.$store.dispatch('rocketTopo/GET_RELYON_DATA', params);
      return res ? res : {nodes: [], links: []};
    },
    async resetTopoDetailData(topoViewData, hitMainTopo) {
      let curNode = this.currentNode;
      let crossLayerData = await this.queryCrosslayerNodes(curNode);
      let elemsIdsCL = {
        nodeIds: [],
        linkIds: []
      };
      crossLayerData.nodes.forEach(node => elemsIdsCL.nodeIds.push(node.id));
      crossLayerData.links.forEach(link => elemsIdsCL.linkIds.push(link.id));

      let nodesTmp;
      let linksTmp;
      if (hitMainTopo) {
        nodesTmp = new Set();
        linksTmp = new Set();
        // 匹配提取topoViewData里的节点对象
        topoViewData.nodes.forEach(node => {
          if (elemsIdsCL.nodeIds.includes(node.id)) {
            nodesTmp.add(node);
          }
        });
        topoViewData.links.forEach(link => {
          if (elemsIdsCL.linkIds.includes(link.id)) {
            linksTmp.add(link);
          }
        });
      } else {
        nodesTmp = new Set(crossLayerData.nodes);
        linksTmp = new Set(crossLayerData.links);
      }
      this.searchStreamOnSingleHop(curNode, this.elemsRTCAll, nodesTmp, linksTmp);
      this.$store.commit('rocketTopo/SET_TOPO_DETAIL_DATA', {
        nodes: Array.from(nodesTmp),
        links: Array.from(linksTmp)
      });
    },
    queryRelativeNodes(params) {
      let res = this.$store.dispatch('rocketTopo/GET_RELATIVE_DATA', params);
      return res ? res : {nodes: [], links: []};
    },
    setAboutElemsRTC(curNode, topoViewData, {elemIdsRTCUpTmp, elemIdsRTCDownTmp}) {
      // 匹配提取topoViewData里的节点对象
      topoViewData.nodes.forEach(node => {
        if (elemIdsRTCUpTmp.nodeIds.includes(node.id) && node.id !== curNode.id) {
          this.elemIdsRTCUp.nodeIds.push(node.id); // 提取元素id
          this.elemsRTCUp.nodes.push(node); // 提取元素对象
        }
        if (elemIdsRTCDownTmp.nodeIds.includes(node.id) && node.id !== curNode.id) {
          this.elemIdsRTCDown.nodeIds.push(node.id);
          this.elemsRTCDown.nodes.push(node);
        }
      });

      // 直接使用topoViewData里的边对象，浅拷贝
      topoViewData.links.forEach(link => {
        if (elemIdsRTCUpTmp.linkIds.includes(link.id)) {
          this.elemIdsRTCUp.linkIds.push(link.id);
          this.elemsRTCUp.links.push(link);
        }
        if (elemIdsRTCDownTmp.linkIds.includes(link.id)) {
          this.elemIdsRTCDown.linkIds.push(link.id);
          this.elemsRTCDown.links.push(link);
        }
      });

      this.elemIdsRTCAll = {
        nodeIds: [curNode.id, ...this.elemIdsRTCUp.nodeIds, ...this.elemIdsRTCDown.nodeIds],
        linkIds: [...this.elemIdsRTCUp.linkIds, ...this.elemIdsRTCDown.linkIds]
      };
      this.$store.commit('rocketTopo/SET_ELEM_IDS_RTC_ALL', this.elemIdsRTCAll);

      this.elemsRTCAll = {
        nodes: [curNode, ...this.elemsRTCUp.nodes, ...this.elemsRTCDown.nodes],
        links: [...this.elemsRTCUp.links, ...this.elemsRTCDown.links]
      };
    },
    async getRelativeElems(curNode, topoViewData, cb) {
      this.restoreElemsRTC();
      let elemIdsRTCUpTmp = {nodeIds: [], linkIds: []};
      let elemIdsRTCDownTmp = {nodeIds: [], linkIds: []};
      let params = {
        id: curNode.id,
        model_type: curNode.type,
        start_time: dateFormat('YYYY-mm-dd HH:MM:SS', this.durationRow.start),
        end_time: dateFormat('YYYY-mm-dd HH:MM:SS', this.durationRow.end),
      };
      params.direction = 'in';
      let upstreamData = await this.queryRelativeNodes(params);
      params.direction = 'out';
      let downstreamData = await this.queryRelativeNodes(params);
      upstreamData.nodes.forEach(node => {
        elemIdsRTCUpTmp.nodeIds.push(node.id);
      });
      upstreamData.links.forEach(link => {
        elemIdsRTCUpTmp.linkIds.push(link.id);
      });
      downstreamData.nodes.forEach(node => {
        elemIdsRTCDownTmp.nodeIds.push(node.id);
      });
      downstreamData.links.forEach(link => {
        elemIdsRTCDownTmp.linkIds.push(link.id);
      });
      this.setAboutElemsRTC(curNode, topoViewData, { elemIdsRTCUpTmp, elemIdsRTCDownTmp });
      if (cb) {
        cb();
      }
    },
    async exploreRelativeElems(curNode, cb, priorParams = null) {
      this.restoreElemsRTC();
      let params = priorParams ? priorParams : {
        id: curNode.id,
        model_type: curNode.type,
        start_time: dateFormat('YYYY-mm-dd HH:MM:SS', this.durationRow.start),
        end_time: dateFormat('YYYY-mm-dd HH:MM:SS', this.durationRow.end),
      };
      params.direction = 'in';
      let upstreamData = await this.queryRelativeNodes(params);
      params.direction = 'out';
      let downstreamData = await this.queryRelativeNodes(params);
      let exploreNodeId = priorParams && priorParams.id ? priorParams.id : curNode.id;
      let exploreNode = upstreamData.nodes.find(node => node.id === exploreNodeId);
      if (cb) {
        cb(upstreamData, downstreamData, exploreNode);
      }
    },

    // 探索
    queryExplore(queryString, cb) {
      let MAX_SEARCH_COUNT = 5;
      let count = 0;
      let results = this.topoViewData.nodes.filter(node => {
        if (queryString && node.id.indexOf(queryString) !== -1 && count < MAX_SEARCH_COUNT) {
          count++;
          return true;
        }
        return false;
      });
      cb(results);
    },
    handleExploreOnId() {
      this.$refs.specificForm.validateField('specificId');
    },
    handleBeforeExplore() {
      this.$store.commit('rocketTopo/SET_VIEW_NODE', {});
      this.$store.commit('rocketTopo/SET_NODE', {});
      this.$store.commit('rocketTopo/SET_EXPLORE_NODE', {});
      this.restoreTopoViewPort(0);
      this.restoreFilters();
    },
    handleAfterExplore(upstreamData, downstreamData, relativeData, exploreNode) {
      upstreamData.nodes.forEach(node => {
        if (node.id !== exploreNode.id) {
          this.elemIdsRTCUp.nodeIds.push(node.id);
        }
      });
      upstreamData.links.forEach(link => {
        this.elemIdsRTCUp.linkIds.push(link.id);
      });
      downstreamData.nodes.forEach(node => {
        if (node.id !== exploreNode.id) {
          this.elemIdsRTCDown.nodeIds.push(node.id);
        }
      });
      downstreamData.links.forEach(link => {
        this.elemIdsRTCDown.linkIds.push(link.id);
      });
      this.elemIdsRTCAll = {
        nodeIds: [exploreNode.id, ...this.elemIdsRTCUp.nodeIds, ...this.elemIdsRTCDown.nodeIds],
        linkIds: [...this.elemIdsRTCUp.linkIds, ...this.elemIdsRTCDown.linkIds]
      };
      this.$store.commit('rocketTopo/SET_ELEM_IDS_RTC_ALL', this.elemIdsRTCAll);
      this.elemsRTCAll = relativeData;

      this.$store.commit('rocketTopo/SET_VIEW_NODE', exploreNode);
      this.$store.commit('rocketTopo/SET_EXPLORE_NODE', exploreNode);
      this.setCurNodeStably(exploreNode);
    },
    goToExploreNode(targetNode) {
      this.handleBeforeExplore();
      this.$store.commit('rocketTopo/SET_TOPO_MODE', 'specific');
      this.exploreRelativeElems(targetNode, (upstreamData, downstreamData, exploreNode) => {
        let relativeData = {
          nodes: [exploreNode,
            ...upstreamData.nodes.filter(node => node.id !== exploreNode.id),
            ...downstreamData.nodes.filter(node => node.id !== exploreNode.id)
          ],
          links: [...upstreamData.links, ...downstreamData.links],
        };
        this.$emit('changeTopoViewData', relativeData);
        this.handleAfterExplore(upstreamData, downstreamData, relativeData, exploreNode);
      });
    },
    handleConfirmExploreBack() {
      this.topoTimeInstance.loadTopoData();
    },
    handleConfirmExplore() {
      if (this.exploreItem === 'specific') {
        let validState = false;
        this.$refs.specificForm.validate((valid) => {
          validState = valid;
        });
        if (!validState) {
          return;
        }
        let result = this.topoViewData.nodes.find(node => String(node.id) === this.specificForm.specificId);
        this.isShowExplore = false;
        this.handleBeforeExplore();
        this.$store.commit('rocketTopo/SET_TOPO_MODE', this.exploreItem);
        this.exploreRelativeElems(result, (upstreamData, downstreamData, exploreNode) => {
          let relativeData = {
            nodes: [exploreNode,
              ...upstreamData.nodes.filter(node => node.id !== exploreNode.id),
              ...downstreamData.nodes.filter(node => node.id !== exploreNode.id)
            ],
            links: [...upstreamData.links, ...downstreamData.links],
          };
          this.$emit('changeTopoViewData', relativeData);
          this.handleAfterExplore(upstreamData, downstreamData, relativeData, exploreNode);
        });
      } else if (this.exploreItem === 'global') {
        this.topoTimeInstance.loadTopoData();
      }
    },
    handleClickExploreBtnBack() {
      this.isShowExploreBack = true;
    },
    handleClickExploreBtn() {
      this.resetIsAutoReloadTopo();
      this.exploreItem = 'specific';
      this.isShowExplore = true;
    },
    refreshTopoView() {
      this.isShowExploreBack = false;
      this.isShowExplore = false;
      this.inputId = '';
      this.$emit('onSearchResult', true);
      this.restoreTopoViewPort(0);
      this.$store.commit('rocketTopo/SET_TOPO_MODE', 'global');
      this.$store.commit('rocketTopo/SET_VIEW_NODE', {});
      this.$store.commit('rocketTopo/SET_QUICK_EXPLORE_NODE', {});
      this.$store.commit('rocketTopo/SET_EXPLORE_NODE', {});
      this.$store.commit('rocketTopo/SET_NODE', {});
      this.restoreFilters();
    },

    // 过滤
    filterTopoWithCurNode({nodeTypes, stateTypes, relativeTypes}, {nodeTypesSet, stateTypesSet, relativeTypesSet}, {elemIdsRTC, targetNodeIds}) {
      if (relativeTypes.includes('Upstream')) {
        elemIdsRTC.nodeIds.push.apply(elemIdsRTC.nodeIds, this.elemIdsRTCUp.nodeIds);
        elemIdsRTC.linkIds.push.apply(elemIdsRTC.linkIds, this.elemIdsRTCUp.linkIds);
        if (this.elemIdsRTCUp.nodeIds.length > 0) {
          relativeTypesSet.add(this.relativeTypesOption.data.find(item => item.id === 'Upstream').label);
        }
      }
      if (relativeTypes.includes('Downstream')) {
        elemIdsRTC.nodeIds.push.apply(elemIdsRTC.nodeIds, this.elemIdsRTCDown.nodeIds);
        elemIdsRTC.linkIds.push.apply(elemIdsRTC.linkIds, this.elemIdsRTCDown.linkIds);
        if (this.elemIdsRTCDown.nodeIds.length > 0) {
          relativeTypesSet.add(this.relativeTypesOption.data.find(item => item.id === 'Downstream').label);
        }
      }
      this.topoViewData.nodes.forEach(node => {
        if ((nodeTypes.includes(node.type) && stateTypes.includes(node.state) && elemIdsRTC.nodeIds.includes(node.id))
          || node.id === this.currentNode.id) {
          targetNodeIds.push(node.id);
          node.isDark = false;
          node.showLabel = true;
          node.isRelatedToCurNode = true;
          nodeTypesSet.add(node.type);
          stateTypesSet.add(this.stateTypesOption.data.find(item => item.id === node.state).label);
        } else {
          node.isDark = true;
          node.showLabel = false;
          node.isRelatedToCurNode = false;
        }
      });
      this.topoViewData.links.forEach(link => {
        if (targetNodeIds.includes(link.sid) && targetNodeIds.includes(link.tid) && elemIdsRTC.linkIds.includes(link.id)) {
          link.isDark = false;
        } else {
          link.isDark = true;
        }
      });
    },
    filterTopoWithoutCurNode({nodeTypes, stateTypes}, {nodeTypesSet, stateTypesSet}, targetNodeIds) {
      this.topoViewData.nodes.forEach(node => {
        if (node.showLabel) { // 选中样式还原
          node.showLabel = false;
        }
        if (node.isRelatedToCurNode) {
          node.isRelatedToCurNode = false;
        }
        if (nodeTypes.includes(node.type) && stateTypes.includes(node.state)) {
          targetNodeIds.push(node.id);
          node.isDark = false;
          nodeTypesSet.add(node.type);
          stateTypesSet.add(this.stateTypesOption.data.find(item => item.id === node.state).label);
        } else {
          node.isDark = true;
        }
      });
      this.topoViewData.links.forEach(link => {
        if (targetNodeIds.includes(link.sid) && targetNodeIds.includes(link.tid)) {
          link.isDark = false;
        } else {
          link.isDark = true;
        }
      });
    },
    filterTopo() {
      let nodeTypes = this.nodeTypesOption.data.filter(type => type.checked).map(type => type.id);
      let stateTypes = this.stateTypesOption.data.filter(type => type.checked).map(type => type.id);
      let relativeTypes = this.relativeTypesOption.data.filter(type => type.checked).map(type => type.id);
      let nodeTypesSet = new Set();
      let stateTypesSet = new Set();
      let relativeTypesSet = new Set();
      let elemIdsRTC = { // 暂存关联元素id
        nodeIds: [],
        linkIds: []
      };
      let targetNodeIds = [];

      if (this.currentNode.id === undefined) {
        this.filterTopoWithoutCurNode({nodeTypes, stateTypes}, {nodeTypesSet, stateTypesSet}, targetNodeIds);
      } else {
        this.filterTopoWithCurNode({nodeTypes, stateTypes, relativeTypes}, {nodeTypesSet, stateTypesSet, relativeTypesSet}, {elemIdsRTC, targetNodeIds});
      }
      if (this.networkInstanceMainTopo.$refs) {
        this.networkInstanceMainTopo.$refs.svg.$forceUpdate();
      }
      this.$store.commit('rocketTopo/SET_SHOW_NODE_TYPES', [...nodeTypesSet]);
      this.$store.commit('rocketTopo/SET_SHOW_STATE_TYPES', [...stateTypesSet]);
      this.$store.commit('rocketTopo/SET_SHOW_RELATIVE_TYPES', [...relativeTypesSet]);
    },
    toggleStateTypeChecked() {
      this.resetIsAutoReloadTopo();
      this.filterTopo();
    },
    toggleNodeTypeChecked() {
      this.resetIsAutoReloadTopo();
      this.filterTopo();
    },
    toggleRelativeTypeChecked() {
      this.resetIsAutoReloadTopo();
      this.filterTopo();
    },

    // 搜索
    querySearch(queryString, cb) {
      let MAX_SEARCH_COUNT = 10;
      let count = 0;
      let results = this.topoViewData.nodes.filter(node => {
        if (queryString && node.id.indexOf(queryString) !== -1 && count < MAX_SEARCH_COUNT) {
          count++;
          return true;
        }
        return false;
      });
      cb(results);
    },
    setCurNodeStably(curNode) {
      let lastX = curNode.x;
      let lastY = curNode.y;
      let staticNum = 0;
      this.tickTimer = setInterval(() => {
        if (parseInt(curNode.x) === parseInt(lastX) && parseInt(curNode.y) === parseInt(lastY)) { // 可放宽限制，加快速度
          staticNum++;
        } else {
          lastX = curNode.x;
          lastY = curNode.y;
          staticNum = 0;
        }
        if (staticNum > 10) {
          clearTimeout(this.tickTimer);
          this.tickTimer = null;
          this.$store.commit('rocketTopo/SET_NODE', curNode);
        }
      }, 10);
    },
    handleFocusInputId() {
      this.resetIsAutoReloadTopo();
    },
    handleMouseUp() {
      this.$refs.swAutocomplete.activated = false;
      this.handleSearchOnId();
    },
    handleSearchOnId() {
      if (this.inputId === '') {
        return;
      }
      let result = {};
      result = this.topoViewData.nodes.find(node => String(node.id) === this.inputId);
      if (result === undefined) {
        this.$emit('onSearchResult', false);
      } else {
        this.$emit('onSearchResult', true);
        this.$store.commit('rocketTopo/SET_VIEW_NODE', result);
        if (this.topoMode === 'global') {
          this.setCurNodeStably(result);
        } else {
          this.networkInstanceMainTopo.setTopoViewport(result, null, false);
        }
      }
    },
    handleClearInputId() {
      this.$refs.swAutocomplete.activated = true;
      this.$emit('onSearchResult', true);
    },
    handleEraseTopo() {
      this.currentNode.fx = null;
      this.currentNode.fy = null;
      this.$store.commit('rocketTopo/SET_NODE', {});
      this.$store.commit('rocketTopo/SET_VIEW_NODE', {});
    },

    // 控制
    handleEnlargeTopo() {
      this.resetIsAutoReloadTopo();
      let zoomTimes = this.$d3.zoomTransform(this.$d3.select(`#zoomContainer${this.topoIdNamespace}`).node()).k;
      if (zoomTimes < 1) {
        zoomTimes = Number((Number(zoomTimes.toFixed(1)) + 0.1).toFixed(1));
      } else if (zoomTimes >= 1) {
        zoomTimes = zoomTimes + 1;
      }
      if (zoomTimes > 100) {
        zoomTimes = zoomTimes - 1;
        return;
      }
      this.networkInstanceMainTopo.zoomController.scaleTo(this.$d3.select(`#netSvg${this.topoIdNamespace}`).transition().duration(750), zoomTimes);
    },
    handleNarrowTopo() {
      this.resetIsAutoReloadTopo();
      let zoomTimes = this.$d3.zoomTransform(this.$d3.select(`#zoomContainer${this.topoIdNamespace}`).node()).k;
      if (zoomTimes < 2) {
        zoomTimes = Number((Number(zoomTimes.toFixed(1)) - 0.1).toFixed(1));
      } else if (zoomTimes >= 2) {
        zoomTimes = zoomTimes - 1;
      }
      if (zoomTimes < 0.1) {
        zoomTimes = Number((Number(zoomTimes.toFixed(1)) + 0.1).toFixed(1));
        return;
      }
      this.networkInstanceMainTopo.zoomController.scaleTo(this.$d3.select(`#netSvg${this.topoIdNamespace}`).transition().duration(750), zoomTimes);
    },
    setNodeTypesFilter(type) {
      this.nodeTypesOption.data.forEach(item => {
        item.checked = item.label === type;
      });
      this.filterTopo();
    },
    restoreFilters() {
      this.moreToolState = false;
      this.nodeTypesOption.data.forEach(item => {
        item.checked = true;
      });
      this.stateTypesOption.data.forEach(item => {
        item.checked = true;
      });
      this.relativeTypesOption.data.forEach(item => {
        item.checked = true;
      });
    },
    restoreTopoTranslate(centerX, centerY, duration) {
      this.networkInstanceMainTopo.zoomController.translateTo(
        this.$d3
          .select(`#netSvg${this.topoIdNamespace}`)
          .transition()
          .duration(duration),
        centerX,
        centerY,
      );
    },
    restoreTopoScale(duration) {
      this.networkInstanceMainTopo.zoomController.scaleTo(
        this.$d3
          .select(`#netSvg${this.topoIdNamespace}`)
          .transition()
          .duration(duration),
        this.networkInstanceMainTopo.topoScaleFix,
      );
    },
    restoreTopoViewPort(duration) {
      let centerX = this.$jq(`#netSvg${this.topoIdNamespace}`).width() / 2;
      let centerY = this.$jq(`#netSvg${this.topoIdNamespace}`).height() / 2;
      let zoomK = this.$d3.zoomTransform(this.$d3.select(`#zoomContainer${this.topoIdNamespace}`).node()).k;
      if (zoomK > this.networkInstanceMainTopo.topoScaleFix) {
        this.restoreTopoScale(duration);
        setTimeout(() => {
          this.restoreTopoTranslate(centerX, centerY, duration);
        }, duration);
      } else if (zoomK === this.networkInstanceMainTopo.topoScaleFix) {
        this.restoreTopoTranslate(centerX, centerY, duration);
      } else {
        this.restoreTopoTranslate(centerX, centerY, duration);
        setTimeout(() => {
          this.restoreTopoScale(duration);
        }, duration);
      }
    },
    handleRestoreTopo() {
      this.resetIsAutoReloadTopo();
      this.restoreTopoViewPort(500);
    },

    // 更多
    handleToggleMoreTool() {
      this.moreToolState = !this.moreToolState;
    },
  }
}
</script>

<style lang="scss">
.topo-tool-set {
    position: absolute;
    right: 262px;
    top: 70px;
    height: 40px;
    padding-left: 10px;
    border-radius: 2px;
    background-color: #242424;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .explore-topo-wrapper,
    .search-wrapper,
    .size-controller,
    .more-tool-btn {
        margin-right: 12px;
        height: 100%;
        display: flex;
        align-items: center;
    }

    .topo-icon {
        margin-right: 5px;
        width: 18px;
        height: 18px;
        overflow: hidden;
        fill: currentColor;
        color: #efeff1;

        &:hover {
            cursor: pointer;
        }

        &.back {
            margin-right: 6px;
        }

        &.explore {
            width: 20px;
            height: 20px;
            margin-right: 0;
        }

        &.erase {
            margin: 0 -3px 0 8px;
        }

        &.restore {
            margin-right: 0;
        }
    }

    .search-wrapper {
        position: relative;

        .el-input__inner {
            height: 32px;
            line-height: 32px;
            border: 0;
            background-color: #333840;
            color: #eee;
            outline: 0;
            padding: 4px 25px;
            border-radius: 4px;
        }

        span {
            height: 100%;
            display: flex;
            align-items: center;
            top: 0;
            color: #efeff1;
            font-size: 16px;

            svg {
                width: 20px;
                height: 20px;

                &:hover {
                    cursor: pointer;
                }
            }
        }
    }

    .explore-topo-wrapper {
        .explore-dialog {
            .el-dialog {
                background-color: #333840;

                .el-dialog__header .el-dialog__title {
                    color: #ccc;
                }

                .el-dialog__body {
                    .modes-wrapper {
                        .mw-item {
                            display: flex;
                            align-items: center;
                            justify-content: flex-start;

                            .specific-radio {
                                margin-bottom: 18px;
                            }

                            .el-radio {
                                color: #ccc;
                                margin-right: 10px;

                                .el-radio__inner {
                                    background-color: rgba(204, 204, 204, 1);

                                    &::after {
                                        background-color: rgba(204, 204, 204, 1);
                                    }
                                }

                                .el-radio__input.is-checked {
                                    .el-radio__inner {
                                        background-color: #409eff;
                                    }
                                }
                            }

                            .el-form {
                                width: 225px;
                            }

                            .el-input {
                                &.is-disabled {
                                    opacity: 0.5;
                                }
                            }

                            .el-input__inner {
                                background-color: #ddd;
                                color: #606266;
                                padding: 0 25px 0 15px;

                                &::-webkit-input-placeholder {
                                    color: #252a2f;
                                    opacity: 0.5;
                                }
                            }

                            .el-input__suffix {
                                right: 3px;
                            }
                        }
                    }
                }

                .el-dialog__footer .dialog-footer {
                    .el-button {
                        border: none;
                        color: #606266;
                    }

                    .el-button--default {
                        background-color: #ccc;
                    }

                    .el-button--primary {
                        color: #ccc;
                    }
                }
            }

            &.back {
                .el-dialog__body {
                    display: none;
                }
            }
        }
    }

    .more-tool-btn {
        margin-right: 10px;
    }

    .more-tool-wrapper {
        position: absolute;
        top: 100%;
        right: 0;
        padding: 8px 10px;
        margin-top: 8px;
        width: 180px;
        background-color: #242424;
        border-radius: 2px;
        -webkit-box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);

        &::after {
            bottom: 100%;
            right: 15px;
            border: solid transparent;
            content: ' ';
            height: 0;
            width: 0;
            position: absolute;
            pointer-events: none;
            border-color: transparent;
            border-bottom-color: #242424;
            border-width: 8px;
            margin-right: 0;
        }

        .fw-item {
            width: 100%;
            color: #ddd;
            position: relative;
            z-index: 9998;
        }
    }

    .tool-filters {
        position: fixed;
        bottom: 0;
        left: 220px;
        padding: 8px 10px;
        margin-top: 8px;
        background-color: transparent;
        pointer-events: none;

        .tb-item {
            width: 100%;
            position: relative;
            z-index: 2000;
            margin-bottom: 20px;

            .ntf-item,
            .stf-item,
            .rtf-item {
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                justify-content: flex-start;

                &.unchecked {
                    opacity: 0.5;
                }

                .item-wrapper {
                    display: flex;
                    align-items: center;
                }

                .item-title {
                    color: #ddd;
                    margin-left: 10px;
                }

                .item-checkbox {
                    pointer-events: all;
                }

                .item-icon {
                    pointer-events: auto;
                    margin-left: 10px;

                    svg {
                        width: 20px;
                        height: 20px;
                    }
                }

                .item-btn {
                    display: inline-block;
                    width: 30px;
                    height: 20px;
                    border-radius: 5px;
                    cursor: pointer;
                }
            }
        }
    }
}

.mw-autocomplete {
    background-color: #ddd;

    li {
        line-height: 32px;
    }

    .el-autocomplete-suggestion__wrap {
        max-height: 96px;
    }

    &.el-popper[x-placement^='bottom'] {
        .popper__arrow,
        .popper__arrow::after {
            border-bottom-color: #ddd;
        }
    }
}

.sw-autocomplete {
    background-color: #242424;
    border: 0;

    li {
        line-height: 32px;
        color: #ddd;

        &:hover {
            background: #333840;
        }
    }

    &.el-popper[x-placement^='bottom'] {
        .popper__arrow,
        .popper__arrow::after {
            border-bottom-color: #252a2f;
        }
    }
}
</style>
