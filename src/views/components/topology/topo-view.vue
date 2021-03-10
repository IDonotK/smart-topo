<template>
  <div class="topo-view-chart">
    <div id="tvccId" class="tvc-c">
      <!-- 左侧拓扑详情 -->
      <div id="tvclId" class="tvc-l">
        <overlay-scrollbars v-show="!foldTopoDetail" id="tdwId" style="height: 100%;" :options="scrollOptions">
          <TopoDetail
            v-if="topoDetailData.nodes.length > 0"
            :topoViewData="topoViewData"
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
        <d3-network
          v-show="topoViewData.nodes.length > 0 && isMatch && !isLoadingTopo"
          ref="net"
          :net-data="netData"
          :options="options"
          :node-sym="nodeSym"
          @node-right-click="nodeRightClick"
          @node-dblclick="nodeDblClick"
          @node-click="nodeClick"
          @link-click="linkClick"
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
import { dateFormat } from '@/utils/topo';

import TopoDetail from './topo-detail.vue';
import NodeDetail from './node-detail.vue';
import TopoTime from './topo-time.vue';

import * as utils from './d3-network/utils.js';
import D3Network from './d3-network/vue-d3-network.vue';

export default {

  components: {
    TopoDetail,
    NodeDetail,
    D3Network,
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
      options: {},
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
    }
  },

  computed: {
    topoMode() {
      return this.$store.state.rocketTopo.topoMode;
    },
    durationRow() {
      return this.$store.state.rocketbot.durationRow;
    },
    isLoadingTopo() {
      return this.$store.state.rocketTopo.isLoadingTopo;
    },
    currentNode() { // 当前选中节点
      return this.$store.state.rocketTopo.currentNode;
    },
    topoDetailData() {
      return this.$store.state.rocketTopo.topoDetailData;
    },
    networkInstance() {
      return this.$store.state.rocketTopo.networkInstance;
    },
    toolSetInstance() {
      return this.$store.state.rocketTopo.toolSetInstance;
    },
  },

  watch: {
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
    // this.reset(); // 拓扑布局测试
  },

  mounted() {
    document.oncontextmenu = function(e){
      e.preventDefault();
    };
    this.initAboutOptions();
    this.initSvgSizeArg();
  },

  destroyed() {
    if (this.tickTimer) {
      clearTimeout(this.tickTimer);
      this.tickTimer = null;
    }
  },

  methods: {
    initAboutOptions() {
      this.options = {
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
      };
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
      this.toolSetInstance.goToExploreNode(this.nodeToExplore);
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
    initSvgSizeArg() {
      this.options.size.w = this.$refs.tvcr.clientWidth;
      this.options.size.h = this.$refs.tvcr.clientHeight;
    },
    initNetTopoData() {
      this.netData = this.topoViewData;
    },
    nodeRightClick(event, node) {
      this.isShowExplore = true;
      this.nodeToExplore = node;
    },
    nodeDblClick(event, node) {
      if (this.topoMode === 'specific') {
        return;
      }
      if (node && this.currentNode && node.id === this.currentNode.id) {
        return;
      }
      if (event && node) {
        this.$store.commit('rocketTopo/SET_VIEW_NODE', node);
        this.setCurNodeStably(node);
      }
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
    reset () {
      this.selected = {};
      this.linksSelected = {};
      this.nodes = utils.makeRandomNodes(this.settings.maxNodes);
      this.lastNodeId = this.nodes.length + 1;
      this.links = utils.makeRandomLinks(this.nodes, this.settings.maxLinks);
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

                                .item-title {
                                    color: #409eff;
                                    width: 60px;
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
