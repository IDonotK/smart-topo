<template>
  <div class="topo-tool-set">
    <!-- 拓扑探索 -->
    <div class="explore-topo-wrapper">
      <svg class="icon topo-icon" @click="handleClickExploreBtn">
        <use xlink:href="#explore"></use>
        <title>探索拓扑</title>
      </svg>
      <el-dialog
        class="explore-dialog"
        title="探索拓扑"
        :visible.sync="isShowExplore"
        width="30%"
        @close="onCloseExploreDialog"
      >
        <div class="modes-wrapper">
          <div class="mw-item">
            <el-radio v-model="exploreMode" label="specific" class="specific-radio">目标节点</el-radio>
            <el-form :model="specificForm" status-icon :rules="specificRules" ref="specificForm">
              <el-form-item prop="specificId">
                <el-input
                  type="text"
                  v-model="specificForm.specificId"
                  autocomplete="off"
                  placeholder="请输入节点ID"
                  :disabled="exploreMode === 'global'"
                ></el-input>
              </el-form-item>
            </el-form>
          </div>
          <div class="mw-item">
            <el-radio v-model="exploreMode" label="global">全部节点</el-radio>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="isShowExplore = false">取 消</el-button>
          <el-button type="primary" @click="handleConfirmExplore">确 定</el-button>
        </span>
      </el-dialog>
    </div>
    <!-- 搜索节点 -->
    <div class="search-wrapper">
      <input
        type="text"
        class="sw-input"
        v-model="inputId"
        placeholder="请输入节点ID"
        @focus="handleFocusInputId"
        @keyup.prevent.enter="handleMouseUp"
      />
      <span class="sw-clear">
        <svg class="icon sm close" @click="handleClearInputId" v-if="inputId">
          <use xlink:href="#clear"></use>
        </svg>
      </span>
      <span class="sw-search">
        <svg class="topo-icon" aria-hidden="true" @click="handleSearchOnId">
          <use xlink:href="#icon-sousuo"></use>
        </svg>
      </span>
    </div>
    <!-- 缩放控制 -->
    <div class="size-controller">
      <svg class="topo-icon larger" aria-hidden="true" @click="handleEnlargeTopo">
        <use xlink:href="#icon-fangdajingfangda"></use>
        <title>放大拓扑</title>
      </svg>
      <svg class="topo-icon smaller" aria-hidden="true" @click="handleNarrowTopo">
        <use xlink:href="#icon-fangdajingsuoxiao"></use>
        <title>缩小拓扑</title>
      </svg>
      <svg
        class="topo-icon restore"
        aria-hidden="true"
        @click.stop.prevent="handleRestoreTopo"
        @dblclick.stop.prevent="handleRestoreTopoToOrigin"
      >
        <use xlink:href="#icon-huanyuan"></use>
        <title>还原拓扑</title>
      </svg>
    </div>
    <!-- 更多按钮 -->
    <!-- <div class="more-tool-btn">
      <svg class="topo-icon more" aria-hidden="true" @click="handleToggleMoreTool">
        <use xlink:href="#icon-gengduo"></use>
      </svg>
    </div> -->
    <!-- 工具集合 -->
    <!-- <div class="more-tool-wrapper" v-show="moreToolState"></div> -->
    <!-- 工具栏 -->
    <div class="tool-bar">
      <div class="tb-item node-types-filter">
        <div
          class="ntf-item"
          v-for="(item, index) in nodeTypesOption.data"
          :key="index"
          :class="{ unchecked: !item.checked }"
        >
          <span class="item-wrapper item-icon"><img :src="item.imgUrl" alt=""/></span>
          <span class="item-wrapper item-title">{{ item.label }}</span>
          <span class="item-wrapper item-checkbox">
            <input type="checkbox" v-model="item.checked" @change="toggleNodeTypeChecked" />
          </span>
        </div>
      </div>
      <div class="tb-item state-types-filter">
        <div
          class="stf-item"
          v-for="(item, index) in stateTypesOption.data"
          :key="index"
          :class="{ unchecked: !item.checked }"
        >
          <span class="item-wrapper item-title">{{ item.label }}</span>
          <span class="item-wrapper item-checkbox">
            <input type="checkbox" v-model="item.checked" @change="toggleStateTypeChecked" />
          </span>
        </div>
      </div>
      <div class="tb-item relative-types-filter" v-show="currentNode.id !== undefined">
        <div
          class="rtf-item"
          v-for="(item, index) in relativeTypesOption.data"
          :key="index"
          :class="{ unchecked: !item.checked }"
        >
          <span class="item-wrapper item-title">{{ item.label }}</span>
          <span class="item-wrapper item-checkbox">
            <input type="checkbox" v-model="item.checked" @change="toggleRelativeTypeChecked" />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="js">
  import axios, { AxiosPromise, AxiosResponse } from 'axios';
  import { cancelToken } from '@/utils/cancelToken';
  import { dateFormat } from '@/utils/topo';

  import applicationIcon from './assets/png/APPLICATION.png';
  import middlewareIcon from './assets/png/MIDDLEWARE.png';
  import processIcon from './assets/png/PROCESS.png';
  import workloadIcon from './assets/png/WORKLOAD.png';
  import podIcon from './assets/png/POD.png';
  import nodeIcon from './assets/png/NODE.png';

  require('./assets/iconfont-toolset/iconfont.js');

  export default {
    props: {
      topoData: {
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
        exploreMode: 'specific',
        specificForm: {
          specificId: ''
        },
        specificRules: {
          specificId: [
            { validator: this.validateId, trigger: 'blur' }
          ],
        },
        inputId: '',
        moreToolState: false,
        pallet: {
          Application: '#3fb1e3',
          MiddleWare: '#a0a7e6',
          Process: '#96dee8',
          Workload: '#3f96e3',
          Pod: '#6be6c1',
          Node: '#6be6c1',
          State: '#626c91',
          Relative: '#a0a7e6',
          other2: '#c4ebad',
          other1: '#96dee8',
        },
        nodeTypesOption: {
          title: '显示节点类型',
          data: [
            {key: 0, label: 'Application', checked: true, imgUrl: applicationIcon},
            {key: 1, label: 'MiddleWare', checked: true, imgUrl: middlewareIcon},
            {key: 2, label: 'Process', checked: true, imgUrl: processIcon},
            {key: 3, label: 'Workload', checked: true, imgUrl: workloadIcon},
            {key: 4, label: 'Pod', checked: true, imgUrl: podIcon},
            {key: 5, label: 'Node', checked: true, imgUrl: nodeIcon},
          ],
        },
        stateTypesOption: {
          title: '节点状态类型',
          data: [
            {key: 0, label: 'Normal', checked: true},
            {key: 1, label: 'Abnormal', checked: true},
          ],
        },
        relativeTypesOption: {
          title: '关联节点类型',
          data: [
            {key: 0, label: '上游节点', checked: true},
            {key: 1, label: '下游节点', checked: true},
          ],
        },
        nodeSingleClickTimer: null,
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
      }
    },

    mounted() {
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

    computed: {
      isAutoReloadTopo() {
        return this.$store.state.rocketTopo.isAutoReloadTopo;
      },
      durationRow() {
        return this.$store.state.rocketbot.durationRow;
      },
      topoMode() {
        return this.$store.state.rocketTopo.topoMode;
      },
      topoScaleFix() {
        return this.$store.state.rocketTopo.topoScaleFix;
      },
      zoomController() {
        return this.$store.state.rocketTopo.zoomController;
      },
      currentNode() {
        return this.$store.state.rocketTopo.currentNode;
      },
      topoDetailData() {
        return this.$store.state.rocketTopo.topoDetailData;
      },
      networkInstance() {
        return this.$store.state.rocketTopo.networkInstance;
      },
      isFirstTick() {
        return this.$store.state.rocketTopo.isFirstTick;
      },
    },

    watch: {
      exploreMode(newVal) {
        this.$refs.specificForm.resetFields();
      },
      topoData(newVal) {
        this.filterTopo();
      },
      inputId(newVal) {
        if (newVal === '') {
          this.$emit('onSearchResult', true);
        }
      },
      currentNode(newVal, oldVal) {
        this.restoreTopoDetailData();
        if (newVal.id !== undefined) {
          this.getRelativeElems(this.currentNode, this.topoData, () => {
            this.networkInstance.setTopoViewport(newVal, oldVal);
            this.resetTopoDetailDataOnLine(this.topoData);
            this.filterTopo();
          });
        } else {
          this.filterTopo();
        }
      },
    },

    methods: {
      validateId(rule, value, callback) {
        if (value === '') {
          callback(new Error('ID不能为空'));
        } else {
          // 向后台查询？
          let result = this.topoData.nodes.find(node => String(node.id) === value);
          if (result === undefined) {
            callback(new Error('节点不存在'));
          } else {
            callback();
          }
        }
      },
      onCloseExploreDialog() {
        this.$refs.specificForm.resetFields();
      },
      resetIsAutoReloadTopo() {
        if (this.networkInstance.simulation) {
          this.networkInstance.simulation.stop();
          if (this.isFirstTick) {
            this.$store.commit('rocketTopo/SET_IS_FIRST_TICK', false);
          }
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
      searchStreamOnSingleHop(curNode, topoData, nodeSet, linkSet) {
        const nodesTmpUp = new Set();
        const linksTmpUp = new Set();
        const nodesTmpDown = new Set();
        const linksTmpDown = new Set();
        topoData.links.forEach(link => {
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
          start_time: dateFormat("YYYY-mm-dd HH:MM:SS", this.durationRow.start),
          end_time: dateFormat("YYYY-mm-dd HH:MM:SS", this.durationRow.end),
        };
        return this.$store.dispatch('rocketTopo/GET_RELYON_DATA', params);
      },
      async resetTopoDetailDataOnLine(topoData) {
        let curNode = this.currentNode;
        let crossLayerData = await this.queryCrosslayerNodes(curNode);
        let elemsIdsCL = {
          nodeIds: [],
          linkIds: []
        };
        crossLayerData.nodes.forEach(node => elemsIdsCL.nodeIds.push(node.id));
        crossLayerData.links.forEach(link => elemsIdsCL.linkIds.push(link.id));

        let nodesTmp = new Set();
        let linksTmp = new Set();
        // 匹配提取topoViewData里的节点对象
        topoData.nodes.forEach(node => {
          if (elemsIdsCL.nodeIds.includes(node.id)) {
            nodesTmp.add(node);
          }
        });
        topoData.links.forEach(link => {
          if (elemsIdsCL.linkIds.includes(link.id)) {
            linksTmp.add(link);
          }
        });

        // 保证curNode索引在上下游节点之前
        nodesTmp.add(curNode); // crossLayerData已包含curNode
        this.searchStreamOnSingleHop(curNode, this.elemsRTCAll, nodesTmp, linksTmp); // this.elemsRTCAll已包含curNode
        this.$store.commit('rocketTopo/SET_TOPO_DETAIL_DATA', {
          nodes: Array.from(nodesTmp),
          links: Array.from(linksTmp)
        });
      },
      queryRelativeNodes(curNode, direction) {
        const params = {
          application_id: curNode.id,
          direction: direction,
          start_time: dateFormat("YYYY-mm-dd HH:MM:SS", this.durationRow.start),
          end_time: dateFormat("YYYY-mm-dd HH:MM:SS", this.durationRow.end),
        };
        return this.$store.dispatch('rocketTopo/GET_RELATIVE_DATA', params);
      },
      async getRelativeElems(curNode, topoData, cb) {
        this.restoreElemsRTC();
        let elemIdsRTCUpTmp = { // 上游节点集合
          nodeIds: [],
          linkIds: []
        };
        let elemIdsRTCDownTmp = { // 下游节点集合
          nodeIds: [],
          linkIds: []
        };
        let upStreamData = await this.queryRelativeNodes(curNode, 'in');
        let downStreamData = await this.queryRelativeNodes(curNode, 'out');
        upStreamData.nodes.forEach(node => {
          elemIdsRTCUpTmp.nodeIds.push(node.id);
        });
        upStreamData.links.forEach(link => {
          elemIdsRTCUpTmp.linkIds.push(link.id);
        });
        downStreamData.nodes.forEach(node => {
          elemIdsRTCDownTmp.nodeIds.push(node.id);
        });
        downStreamData.links.forEach(link => {
          elemIdsRTCDownTmp.linkIds.push(link.id);
        });

        // 匹配提取topoData里的节点对象
        topoData.nodes.forEach(node => {
          if (elemIdsRTCUpTmp.nodeIds.includes(node.id)) {
            this.elemIdsRTCUp.nodeIds.push(node.id); // 提取元素id
            this.elemsRTCUp.nodes.push(node); // 提取元素对象
          }
          if (elemIdsRTCDownTmp.nodeIds.includes(node.id)) {
            this.elemIdsRTCDown.nodeIds.push(node.id);
            this.elemsRTCDown.nodes.push(node);
          }
        });
        topoData.links.forEach(link => {
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
          nodeIds: [...this.elemIdsRTCUp.nodeIds, ...this.elemIdsRTCDown.nodeIds],
          linkIds: [...this.elemIdsRTCUp.linkIds, ...this.elemIdsRTCDown.linkIds]
        };
        this.$store.commit('rocketTopo/SET_ELEM_IDS_RTC_ALL', this.elemIdsRTCAll);

        this.elemsRTCAll = {
          nodes: [curNode, ...this.elemsRTCUp.nodes, ...this.elemsRTCDown.nodes],
          links: [...this.elemsRTCUp.links, ...this.elemsRTCDown.links]
        };

        // 执行回调函数
        if (cb) {
          cb();
        }
      },
      async exploreRelativeElems(curNode, cb) {
        let elemIdsRTCUpTmp = { // 上游节点集合
          nodeIds: [],
          linkIds: []
        };
        let elemIdsRTCDownTmp = { // 下游节点集合
          nodeIds: [],
          linkIds: []
        };
        let upStreamData = await this.queryRelativeNodes(curNode, 'in');
        let downStreamData = await this.queryRelativeNodes(curNode, 'out');
        let topoDataTmp = {
          nodes: [curNode, ...upStreamData.nodes, ...downStreamData.nodes],
          links: [...upStreamData.links, ...downStreamData.links]
        };
        this.$store.commit('rocketTopo/SET_TOPO_DATA', {
          nodes: topoDataTmp.nodes,
          links: topoDataTmp.links
        });
        // 执行回调函数
        if (cb) {
          cb();
        }
      },

      // 探索
      goToExploreNode(targetNode) {
        this.$store.commit('rocketTopo/SET_VIEW_NODE', {});
        this.$store.commit('rocketTopo/SET_NODE', {});
        this.restoreTopoViewPort(0);
        this.restoreFilters();
        this.$store.commit('rocketTopo/SET_TOPO_MODE', 'specific');
        this.exploreRelativeElems(targetNode, () => {
          this.$store.commit('rocketTopo/SET_VIEW_NODE', targetNode);
          this.$store.commit('rocketTopo/SET_EXPLORE_NODE', targetNode);
          this.setCurNodeStably(targetNode);
        });
      },
      handleConfirmExplore() {
        if (this.exploreMode === 'specific') {
          let validState = false;
          this.$refs.specificForm.validate((valid) => {
            validState = valid;
          });
          if (!validState) {
            return;
          }
          // 向后台查询节点？
          let result = this.topoData.nodes.find(node => String(node.id) === this.specificForm.specificId);
          this.isShowExplore = false;
          this.$store.commit('rocketTopo/SET_VIEW_NODE', {});
          this.$store.commit('rocketTopo/SET_NODE', {});
          this.restoreTopoViewPort(0);
          this.restoreFilters();
          this.$store.commit('rocketTopo/SET_TOPO_MODE', this.exploreMode);
          this.exploreRelativeElems(result, () => {
            this.$store.commit('rocketTopo/SET_VIEW_NODE', result);
            this.$store.commit('rocketTopo/SET_EXPLORE_NODE', result);
            this.setCurNodeStably(result);
          });
        } else if (this.exploreMode === 'global') {
          this.refreshTopoView();
          this.$store.dispatch('rocketTopo/GET_TOPO_DATA', {
            start_time: dateFormat("YYYY-mm-dd HH:MM:SS", this.durationRow.start),
            end_time: dateFormat("YYYY-mm-dd HH:MM:SS", this.durationRow.end),
          });
        }
      },
      handleClickExploreBtn() {
        this.resetIsAutoReloadTopo();
        this.exploreMode = 'specific';
        this.isShowExplore = true;
      },
      refreshTopoView() {
        this.isShowExplore = false;
        this.restoreTopoViewPort(0);
        this.$store.commit('rocketTopo/SET_TOPO_MODE', 'global'); // 刷新回到global
        this.$store.commit('rocketTopo/SET_VIEW_NODE', {});
        this.$store.commit('rocketTopo/SET_NODE', {});
        this.restoreFilters();
      },

      // 过滤
      filterTopo() {
        let nodeTypes = this.nodeTypesOption.data.filter(type => type.checked).map(type => type.label);
        let stateTypes = this.stateTypesOption.data.filter(type => type.checked).map(type => type.label);
        let relativeTypes = this.relativeTypesOption.data.filter(type => type.checked).map(type => type.label);
        let nodeTypesSet = new Set();
        let stateTypesSet = new Set();
        let relativeTypesSet = new Set();
        let elemIdsRTC = { // 暂存关联元素id
          nodeIds: [],
          linkIds: []
        };
        let targetNodeIds = [];

        if (this.currentNode.id !== undefined) { // 已选中节点过滤
          if (relativeTypes.includes('上游节点')) {
            elemIdsRTC.nodeIds.push.apply(elemIdsRTC.nodeIds, this.elemIdsRTCUp.nodeIds);
            elemIdsRTC.linkIds.push.apply(elemIdsRTC.linkIds, this.elemIdsRTCUp.linkIds);
            if (this.elemIdsRTCUp.nodeIds.length > 0) {
              relativeTypesSet.add('上游节点');
            }
          }
          if (relativeTypes.includes('下游节点')) {
            elemIdsRTC.nodeIds.push.apply(elemIdsRTC.nodeIds, this.elemIdsRTCDown.nodeIds);
            elemIdsRTC.linkIds.push.apply(elemIdsRTC.linkIds, this.elemIdsRTCDown.linkIds);
            if (this.elemIdsRTCDown.nodeIds.length > 0) {
              relativeTypesSet.add('下游节点');
            }
          }
          this.topoData.nodes.forEach(node => {
            if ((nodeTypes.includes(node.type) && stateTypes.includes(node.state) && elemIdsRTC.nodeIds.includes(node.id))
              || node.id === this.currentNode.id) {
              targetNodeIds.push(node.id);
              node.isDark = false;
              node.showLabel = true;
              node.isRelatedToCurNode = true;
              nodeTypesSet.add(node.type);
              stateTypesSet.add(node.state);
            } else {
              node.isDark = true;
              node.showLabel = false;
              node.isRelatedToCurNode = false;
            }
          });
          this.topoData.links.forEach(link => {
            if (targetNodeIds.includes(link.sid) && targetNodeIds.includes(link.tid) && elemIdsRTC.linkIds.includes(link.id)) {
              link.isDark = false;
            } else {
              link.isDark = true;
            }
          });
        } else { // 未选中节点过滤
          this.topoData.nodes.forEach(node => {
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
              stateTypesSet.add(node.state);
            } else {
              node.isDark = true;
            }
          });
          this.topoData.links.forEach(link => {
            if (targetNodeIds.includes(link.sid) && targetNodeIds.includes(link.tid)) {
              link.isDark = false;
            } else {
              link.isDark = true;
            }
          });
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
        this.handleSearchOnId();
      },
      handleSearchOnId() {
        if (this.inputId === '') {
          return;
        }
        let result = {};
        result = this.topoData.nodes.find(node => String(node.id) === this.inputId);
        if (result === undefined) {
          this.$emit('onSearchResult', false);
        } else {
          this.$emit('onSearchResult', true);
          this.$store.commit('rocketTopo/SET_VIEW_NODE', result);
          this.setCurNodeStably(result);
          // this.$store.commit('rocketTopo/SET_NODE', result);
        }
      },
      handleClearInputId() {
        this.inputId = '';
        this.$emit('onSearchResult', true);
      },

      // 控制
      handleEnlargeTopo() {
        this.resetIsAutoReloadTopo();
        let zoomTimes = this.$d3.zoomTransform(this.$d3.select('#zoomContainer').node()).k;
        if (zoomTimes < 1) {
          zoomTimes = Number((Number(zoomTimes.toFixed(1)) + 0.1).toFixed(1));
        } else if (zoomTimes >= 1) {
          zoomTimes = zoomTimes + 1;
        }
        if (zoomTimes > 100) {
          zoomTimes = zoomTimes - 1;
          return;
        }
        this.zoomController.scaleTo(this.$d3.select('.net-svg').transition().duration(750), zoomTimes);
      },
      handleNarrowTopo() {
        this.resetIsAutoReloadTopo();
        let zoomTimes = this.$d3.zoomTransform(this.$d3.select('#zoomContainer').node()).k;
        if (zoomTimes < 2) {
          zoomTimes = Number((Number(zoomTimes.toFixed(1)) - 0.1).toFixed(1));
        } else if (zoomTimes >= 2) {
          zoomTimes = zoomTimes - 1;
        }
        if (zoomTimes < 0.1) {
          zoomTimes = Number((Number(zoomTimes.toFixed(1)) + 0.1).toFixed(1));
          return;
        }
        this.zoomController.scaleTo(this.$d3.select('.net-svg').transition().duration(750), zoomTimes);
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
      restoreTopoViewPort(duration) {
        let centerX = this.$jq('#netSvg').width() / 2;
        let centerY = this.$jq('#netSvg').height() / 2;
        let zoomK = this.$d3.zoomTransform(this.$d3.select('#zoomContainer').node()).k;
        if (zoomK > this.topoScaleFix) {
          this.zoomController.scaleTo(
            this.$d3
              .select('.net-svg')
              .transition()
              .duration(duration),
            this.topoScaleFix,
          );
          setTimeout(() => {
            this.zoomController.translateTo(
              this.$d3
                .select('.net-svg')
                .transition()
                .duration(duration),
              centerX,
              centerY,
            );
          }, duration);
        } else if (zoomK === this.topoScaleFix) {
          this.zoomController.translateTo(
            this.$d3
              .select('.net-svg')
              .transition()
              .duration(duration),
            centerX,
            centerY,
          );
        } else {
          this.zoomController.translateTo(
            this.$d3
              .select('.net-svg')
              .transition()
              .duration(duration),
            centerX,
            centerY,
          );
          setTimeout(() => {
            this.zoomController.scaleTo(
              this.$d3
                .select('.net-svg')
                .transition()
                .duration(duration),
              this.topoScaleFix,
            );
          }, duration);
        }
      },
      handleRestoreTopo() {
        this.resetIsAutoReloadTopo();
        if (this.nodeSingleClickTimer !== null) {
          clearTimeout(this.nodeSingleClickTimer);
          this.nodeSingleClickTimer = null;
          return;
        }
        this.nodeSingleClickTimer = setTimeout(() => {
          this.nodeSingleClickTimer = null;
          this.inputId = '';
          this.$emit('onSearchResult', true);
          this.currentNode.fx = null;
          this.currentNode.fy = null;
          this.$store.commit('rocketTopo/SET_NODE', {});
          this.$store.commit('rocketTopo/SET_VIEW_NODE', {});
          this.restoreTopoViewPort(500);
        }, 300);
      },
      handleRestoreTopoToOrigin() {
        this.resetIsAutoReloadTopo();
        this.inputId = '';
        this.$emit('onSearchResult', true);
        this.currentNode.fx = null;
        this.currentNode.fy = null;
        this.$store.commit('rocketTopo/SET_NODE', {});
        this.$store.commit('rocketTopo/SET_VIEW_NODE', {});
        this.restoreFilters();
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
    right: 2px;
    top: 2px;
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

      &.restore {
        margin-right: 0px;
      }
    }

    .explore-topo-wrapper {
      .explore-dialog {
        z-index: 99999 !important;

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

                  &::-webkit-input-placeholder {
                    color: #252a2f;
                    opacity: 0.5;
                  }
                }
              }
            }
          }

          .el-dialog__footer .dialog-footer {
            .el-button {
              border: none;
            }

            .el-button--default {
              background-color: #ccc;
            }

            .el-button--primary {
              color: #ccc;
            }
          }
        }
      }
    }

    .search-wrapper {
      position: relative;

      .sw-input {
        width: calc(100% - 4px);
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
        position: absolute;
        top: 0;
        color: #efeff1;
        font-size: 16px;

        svg {
          width: 16px;
          height: 16px;

          &:hover {
            cursor: pointer;
          }
        }
      }

      .sw-search {
        left: 5px;
      }

      .sw-clear {
        right: 10px;
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

      &:after {
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

    .tool-bar {
      position: absolute;
      top: 100%;
      right: 0;
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
          justify-content: flex-end;

          &.unchecked {
            opacity: 0.5;
          }

          .item-wrapper {
            display: flex;
            align-items: center;
          }

          .item-title {
            color: #ddd;
            margin-right: 10px;
          }

          .item-checkbox {
            pointer-events: all;
          }

          .item-icon {
            margin-right: 5px;
            img {
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
</style>
