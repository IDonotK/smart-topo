<template>
  <div class="topo-view-chart">
    <div id="tvccId" class="tvc-c">
      <!-- 左侧拓扑详情 -->
      <div id="tvclId" class="tvc-l">
        <overlay-scrollbars v-show="!foldTopoDetail" id="tdwId" style="height: 100%;" :options="scrollOptions">
          <TopoDetail
            v-if="topoDetailData.nodes.length > 0"
            :topoViewData="topoViewData"
            :foldTopoDetail="foldTopoDetail"
            @toggleNodeDetail="toggleNodeDetail"
          />
        </overlay-scrollbars>
        <div v-if="currentNode && currentNode.id !== undefined" class="tvcl-close">
          <span
            :class="{ 'tvclc-icon': true, 'tvlci-fold': foldTopoDetail }"
            @click.stop.prevent="toggleTopoDetail"
          ></span>
        </div>
        <!-- 节点详情 -->
        <div v-if="showNodeDetail" class="node-detail-wrapper">
          <NodeDetail :topoViewData="topoViewData" @toggleNodeDetail="toggleNodeDetail" />
        </div>
      </div>
      <!-- 右侧主拓扑图 -->
      <div id="tvcrId" ref="tvcr" class="tvc-r">
        <!-- 时间轴 -->
        <div class="topo-time-wrapper">
          <TopoTime />
        </div>
        <!-- 拓扑图 -->
        <adaptive-network
          v-if="topoMode !== 'specific-layered' && topoViewData.nodes.length > 0 && isMatch && !isLoadingTopo"
          ref="net"
          :net-data="netData"
          :options="mainTopoOptions"
          :node-sym="nodeSym"
          :currentNode="currentNode"
          @node-right-click="nodeRightClick"
          @node-dblclick="nodeDblClick"
          @node-click="nodeClick"
          @link-click="linkClick"
          @quickexplore-click="quickexploreClick"
        />
        <layered-network
          v-if="topoMode === 'specific-layered' && topoViewData.nodes.length > 0 && isMatch && !isLoadingTopo"
          :net-data="netData"
          :currentNode="currentNode"
          @node-right-click="nodeRightClick"
          @node-dblclick="nodeDblClick"
          @node-click="nodeClick"
          @quickexplore-click="quickexploreClick"
        />
        <!-- 鼠标右键探索弹框 -->
        <el-dialog
          class="explore-dialog"
          :title="$t('topoView_explore_node_title')"
          :visible.sync="isShowExplore"
          width="30%"
        >
          <div class="modes-wrapper">
            <div class="mw-item">
              <span class="item-title">{{ $t('topoView_explore_node_id') }}</span>
              <span class="item-content">{{ nodeToExplore.id }}</span>
            </div>
            <div class="mw-item">
              <span class="item-title">{{ $t('topoView_explore_node_topo') }}</span>
              <span class="item-content">
                <span class="ic-option">
                  <el-radio v-model="exploreTopoStyle" label="circle">{{ $t('topoView_explore_node_topo_cirlce') }}</el-radio>
                  <el-tooltip
                    class="item-btn"
                    effect="light"
                    :content="$t('topoView_explore_node_topo_cirlce_help')"
                    placement="top"
                  >
                    <svg class="icon sm vm help-icon">
                      <use xlink:href="#HELP"></use>
                    </svg>
                  </el-tooltip>
                </span>
                <span class="ic-option">
                  <el-radio v-model="exploreTopoStyle" label="layered">{{ $t('topoView_explore_node_topo_layered') }}</el-radio>
                  <el-tooltip
                    class="item-btn"
                    effect="light"
                    :content="$t('topoView_explore_node_topo_layered_help')"
                    placement="top"
                  >
                    <svg class="icon sm vm help-icon">
                      <use xlink:href="#HELP"></use>
                    </svg>
                  </el-tooltip>
                </span>
              </span>
            </div>
          </div>
          <template v-slot:footer class="dialog-footer">
            <el-button @click="isShowExplore = false">{{ $t('cancel') }}</el-button>
            <el-button type="primary" @click="handleConfirmExplore">{{ $t('confirm') }}</el-button>
          </template>
        </el-dialog>
        <!-- 加载过程样式 -->
        <div v-show="isLoadingTopo" class="main-topo-loading">
          <svg class="icon loading">
            <use xlink:href="#spinner-light"></use>
          </svg>
        </div>
        <!-- 加载结果为空样式 -->
        <div v-show="topoViewData.nodes.length === 0 && !isLoadingTopo" class="main-topo-empty">
          {{ $t('noData') }}
        </div>
        <!-- 搜索无匹配结果样式 -->
        <div v-show="!isMatch && !isLoadingTopo && topoViewData.nodes.length > 0" class="main-topo-not-match">
          {{ $t('topoView_search_no_data') }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="js">
import { dateFormat, formatTopoData, utc2Peking } from '@/utils/topo';

import TopoDetail from './topo-detail.vue';
import NodeDetail from './node-detail.vue';
import TopoTime from './topo-time.vue';

import * as ANUtils from './adaptive-network/utils/index.js';
import AdaptiveNetwork from './adaptive-network/vue-adaptive-network.vue';
import LayeredNetwork from './layered-network/vue-layered-network.vue';

import Worker from './utils/topo.worker.js';

import { getA1Both } from './mo-test-data.js';

export default {

  components: {
    TopoDetail,
    NodeDetail,
    AdaptiveNetwork,
    LayeredNetwork,
    TopoTime
  },
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
    isMatch: {
      type: Boolean,
      default: true
    },
  },

  data() {
    return {
      netData: {
        nodes: [],
        links: []
      },
      showMenu: false,
      selected: {},
      showSelection: false,
      linksSelected: {},
      mainTopoOptions: {},
      relativeTopoOptions: {},
      settings: {
        maxLinks: 1,
        maxNodes: 36
      },
      nodeSym: null,
      foldTopoDetail: false,
      loading: true,
      scrollOptions: {},
      showNodeDetail: false,
      isShowExplore: false,
      isShowEvents: false,
      nodeToExplore: {},
      tickTimer: null,
      topoWorker: null,
      testData: {
        nodes: [],
        links: []
      },
      exploreTopoStyle: 'circle',
    }
  },

  computed: {
    networkInstanceMainTopo() {
      return this.$store.state.rocketTopo.networkInstanceMainTopo;
    },
    topoMode() {
      return this.$store.state.rocketTopo.topoMode;
    },
    durationRow() {
      return this.$store.state.rocketbot.durationRow;
    },
    isLoadingTopo() {
      return this.$store.state.rocketTopo.isLoadingTopo;
    },
    quickExploreNode() {
      return this.$store.state.rocketTopo.quickExploreNode;
    },
    exploreNode() {
      return this.$store.state.rocketTopo.exploreNode;
    },
    currentNode() { // 当前选中节点
      return this.$store.state.rocketTopo.currentNode;
    },
    topoDetailData() {
      return this.$store.state.rocketTopo.topoDetailData;
    },
    toolSetInstance() {
      return this.$store.state.rocketTopo.toolSetInstance;
    },
  },

  watch: {
    exploreNode: {
      handler (newVal, oldVal) {
        if (newVal.id !== oldVal.id) {
          if (this.topoWorker) {
            this.topoWorker.postMessage({
              cmd: 'cancel',
            });
            this.topoWorker.terminate();
            this.topoWorker = null;
          } 
        }      
        if (newVal.id !== undefined && newVal.id !== oldVal.id && this.topoMode !== 'global') {
          this.execTopoWorker(newVal);
        }
      },
      immediate: false,
      deep: false,
    },
    topoViewData(newVal, oldVal) {
      this.initNetTopoData();
    },
    topoDetailData(newVal, oldVal) {
      if (newVal.nodes.length > 0) {
        this.foldTopoDetail = false;
      } else {
        this.foldTopoDetail = true;
      }
    },
    currentNode(newVal, oldVal) {
      if (this.showNodeDetail) {
        this.showNodeDetail = false;
        this.$store.commit('rocketTopo/SET_NODE_CROSS_LAYER', {});
      }
    },
    foldTopoDetail(newVal, oldVal) { // 控制 toolFilters 左偏移距离
      this.handleToolBarOffsetLeft(this.showNodeDetail);
    },
    showNodeDetail(newVal, oldVal) { // 控制 toolFilters 左偏移距离
      this.handleToolBarOffsetLeft(newVal);
    }
  },

  created() {
    this.initNetTopoData();
    // this.layoutTest(); // 布局测试
  },

  mounted() {
    document.oncontextmenu = function(e){
      e.preventDefault();
    };
    this.initOptions();
    this.initSvgSize();

    this.testData = formatTopoData(getA1Both(), true);
  },

  destroyed() {
    if (this.tickTimer) {
      clearTimeout(this.tickTimer);
      this.tickTimer = null;
    }
    if (this.topoWorker) {
      this.topoWorker.terminate();
      this.topoWorker = null;
    }
  },

  methods: {
    updateQucikExploreState(target, abnormalMap) {
      let node = abnormalMap.get(target.id);
      node.downstreamEventLevel = target.eventLevel;
      this.networkInstanceMainTopo.$refs.svg.$forceUpdate();
    },
    execTopoWorker(node) {
      let abnormalMap = new Map();
      let abnormalNodes = [];
      this.topoViewData.nodes.forEach(item => {
        if (['Application','MiddleWare'].includes(item.type) && item.eventCount > 0) {
          abnormalMap.set(item.id, item);
          abnormalNodes.push({
            id: item.id,
            type: item.type,
          });
        }
      });
      if (abnormalNodes.length > 0) {      
        this.topoWorker = new Worker();
        this.topoWorker.postMessage({
          cmd: 'start',
          options: {
            data: abnormalNodes,
            args: {
              direction: 'out',
              start_time: dateFormat('YYYY-mm-dd HH:MM:SS', this.durationRow.start),
              end_time: dateFormat('YYYY-mm-dd HH:MM:SS', this.durationRow.end),
            },
          },
        });
        this.topoWorker.onmessage = (e) => {
          if (e.data && e.data.cmd) {
            switch (e.data.cmd) {
              case 'update': this.updateQucikExploreState(e.data.options.data, abnormalMap); break;
              case 'end': this.topoWorker.terminate(); this.topoWorker = null; break;
              default: break;
            }
          }
        }
      }
    },
    initOptions() {
      this.mainTopoOptions = {
        canvas: false,
        size: {
          w: 0,
          h: 0,
        },
        force: 350,
        offset: {
          x: 0,
          y: 0,
        },
        nodeSize: 20,
        linkWidth: 1,
        fontSize: 16,
        nodeLabels: true,
        linkLabels: true,
        strLinks: true,
        idNamespace: 'MainTopo'
      };
      this.relativeTopoOptions = JSON.parse(JSON.stringify(this.mainTopoOptions));
      this.relativeTopoOptions.idNamespace = 'RelativeTopo';
      this.scrollOptions = {
        className: 'os-theme-light',
        resize: 'none',
        sizeAutoCapable : true,
        paddingAbsolute : true,
        scrollbars : {
          clickScrolling : true,
          dragScrolling: true,
        }
      };
    },
    handleConfirmExplore() {
      this.isShowExplore = false;
      if (this.exploreTopoStyle === 'circle') {
        this.toolSetInstance.goToExploreNode(this.nodeToExplore);
      } else {
        this.layeredExplore(this.nodeToExplore);
      }
      this.nodeToExplore = {};
    },
    toggleNodeDetail(state) {
      this.showNodeDetail = state;
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
    initSvgSize() {
      this.mainTopoOptions.size.w = this.$refs.tvcr.clientWidth;
      this.mainTopoOptions.size.h = this.$refs.tvcr.clientHeight;
    },
    initNetTopoData() {
      this.netData = this.topoViewData;
    },
    nodeRightClick(event, node) {
      this.isShowExplore = true;
      this.nodeToExplore = node;
    },
    nodeDblClick(event, node) {
      // if (this.topoMode !== 'global') {
      //   return;
      // }
      if (node && this.currentNode && node.id === this.currentNode.id) {
        return;
      }
      if (event && node) {
        this.$store.commit('rocketTopo/SET_VIEW_NODE', node);
        this.setCurNodeStably(node);
      }
    },
    async quickexploreClick(event, node) {
      this.$store.commit('rocketTopo/SET_QUICK_EXPLORE_NODE', node);
      let params = {
        id: node.id,
        model_type: node.type,
        direction: 'both',
        start_time: dateFormat('YYYY-mm-dd HH:MM:SS', this.durationRow.start),
        end_time: dateFormat('YYYY-mm-dd HH:MM:SS', this.durationRow.end),
      }
      localStorage.setItem('exploreParams', JSON.stringify(params));
      let exploreUrl = this.$router.resolve({
        path: '/topology',
        query: {
          exploreType: 'specific-deep',
        },
      });
      window.open(exploreUrl.href, '_blank');
    },
    async layeredExplore(node) {
      this.$store.commit('rocketTopo/SET_LAYERED_EXPLORE_NODE', node);
      let params = {
        id: node.id,
        model_type: node.type,
        direction: 'both',
        start_time: dateFormat('YYYY-mm-dd HH:MM:SS', this.durationRow.start),
        end_time: dateFormat('YYYY-mm-dd HH:MM:SS', this.durationRow.end),
      }
      localStorage.setItem('exploreParams', JSON.stringify(params));
      let exploreUrl = this.$router.resolve({
        path: '/topology',
        query: {
          exploreType: 'specific-layered',
        },
      });
      window.open(exploreUrl.href, '_blank');
    },
    nodeClick(event, node) {
      this.$store.commit('rocketTopo/SET_VIEW_NODE', node);
    },
    linkClick() {},
    toggleTopoDetail() {
      this.foldTopoDetail = !this.foldTopoDetail;
      if (this.showNodeDetail) {
        this.showNodeDetail = false;
        this.$store.commit('rocketTopo/SET_NODE_CROSS_LAYER', {});
      }
    },
    layoutTest() {
      this.selected = {};
      this.linksSelected = {};
      this.nodes = ANUtils.makeRandomNodes(this.settings.maxNodes);
      this.lastNodeId = this.nodes.length + 1;
      this.links = ANUtils.makeRandomLinks(this.nodes, this.settings.maxLinks);
      this.lastLinkId = this.links.length + 1;
      this.netData = {
        nodes: this.nodes,
        links: this.links
      }
    },
    handleToolBarOffsetLeft(showNodeDetail) {
      this.$nextTick(() => {
        let nodeDetailWidth = showNodeDetail ? this.$jq('#tdt-view-node-detail').width() : 0;
        let topoDetailWidth = this.$jq('#tvclId').width();
        let width = Math.max(topoDetailWidth, nodeDetailWidth);
        this.toolSetInstance.$refs.toolFilters.style.left = `${220 +  width  }px`;
      });
    }
  },
};
</script>
<style lang="scss">
.topo-view-chart {
    position: absolute;
    top: 2px;
    left: 220px;
    right: 260px;
    bottom: 2px;
    background-color: #333840;
    text-align: center;
    overflow: hidden;

    .tvc-c {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: flex-start;

        .tvc-l {
            -webkit-transition: 0.1s width;
            transition: 0.1s width;
            height: 100%;
            position: relative;
            z-index: 9999;

            .tvcl-close {
                position: absolute;
                top: 0;
                right: 0;
                width: 20px;
                height: 100%;

                .tvclc-icon {
                    position: absolute;
                    top: 2px;
                    right: -15px;
                    width: 0;
                    height: 0;
                    border-style: solid;
                    border-width: 16px 12px 16px 0;
                    border-color: transparent #ccc transparent transparent;
                    display: block;
                    z-index: 990;
                    transition: all 2s;
                    -webkit-transition: all 0.5s;
                    cursor: pointer;
                }

                .tvlci-fold {
                    transform: rotate(180deg);
                    -webkit-transform: rotate(180deg);
                }
            }

            .node-detail-wrapper {
                width: 600px;
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
                background-color: #252a2f;
                z-index: 9000;
                -webkit-transition: 0.5s width;
                transition: 0.5s width;
            }
        }

        .tvc-r {
            flex-grow: 1;
            -webkit-transition: 0.1s width;
            transition: 0.1s width;
            max-width: 100%;
            height: 100%;
            position: relative;

            .topo-time-wrapper {
                position: absolute;
                top: 2px;
                width: 100%;
                z-index: 1;
            }

            .explore-dialog {
                .el-dialog {
                    background-color: #333840;

                    .el-dialog__header {
                        text-align: left;

                        .el-dialog__title {
                            color: #ccc;
                        }
                    }

                    .el-dialog__body {
                        .modes-wrapper {
                            .mw-item {
                                color: #ddd;
                                text-align: left;
                                display: flex;

                                .item-title {
                                    color: #ddd;
                                    width: 80px;
                                }

                                .item-content {
                                    .ic-option {
                                        margin-right: 20px;

                                        .el-radio {
                                            color: #ccc;
                                            margin-right: 3px;
                                        }
                                    }
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
            }

            .main-topo-loading {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;

                .icon {
                    width: 50px;
                    height: 50px;
                }
            }

            .main-topo-empty,
            .main-topo-not-match {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                color: #ccc;
                font-size: 25px;
            }
        }
    }
}
</style>
