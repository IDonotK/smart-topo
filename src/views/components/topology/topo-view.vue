<template>
  <div class="topo-view-chart">
    <div id="tvccId" class="tvc-c">
      <!-- 左侧拓扑详情 -->
      <div class="tvc-l" id="tvclId">
        <overlay-scrollbars id="tdwId" style="height:100%" :options="scrollOptions" v-show="!foldTopoDetail">
          <TopoDetail
            v-if="topoDetailData.nodes.length > 0"
            :topoViewData="topoViewData"
            @toggleNodeDetail="toggleNodeDetail"
          />
        </overlay-scrollbars>
        <div class="tvcl-close" v-if="currentNode && currentNode.id !== undefined">
          <span
            class="tvclc-icon"
            :class="{ 'tvlci-fold': foldTopoDetail }"
            @click.stop.prevent="toggleTopoDetail"
          ></span>
        </div>
        <!-- 节点详情 -->
        <div class="node-detail-wrapper" v-if="showNodeDetail">
          <NodeDetail :topoViewData="topoViewData" @toggleNodeDetail="toggleNodeDetail" />
        </div>
      </div>
      <!-- 右侧主拓扑图 -->
      <div class="tvc-r" id="tvcrId" ref="tvcr">
        <!-- 拓扑标题 -->
        <div class="main-topo-info" v-show="topoViewData.nodes.length > 0 && isMatch">
          <div class="mti-item topo-mode">
            <span class="title">拓扑探索模式：</span>
            <span class="content" v-show="topoMode === 'global'">全部节点</span>
            <span class="content" v-show="topoMode === 'specific'">目标节点({{ exploreNode.id }})</span>
          </div>
          <div class="mti-item show-node-type">
            <span class="title">显示的节点类型：</span>
            <span class="content">{{ showNodeTypes.join(', ') }}</span>
          </div>
          <div class="mti-item node-state-type">
            <span class="title">显示的节点状态：</span>
            <span class="content">{{ showStateTypes.join(', ') }}</span>
          </div>
          <div class="mti-item current-node" v-show="currentNode.id !== undefined">
            <span class="title">选中节点的名称：</span>
            <span class="content">{{ currentNode.name }}</span>
          </div>
          <div class="mti-item relative-node-type" v-show="currentNode.id !== undefined">
            <span class="title">选中节点的关联节点类型：</span>
            <span class="content">{{ showRelativeTypes.join(', ') }}</span>
          </div>
          <!-- 查看节点详情 -->
          <div class="mti-item view-node-info" v-show="viewNode.id !== undefined">
            <div class="info-title">当前查看的节点信息:</div>
            <div
              class="info-item"
              v-for="(value, key) in viewNode"
              :key="key"
              v-show="
                nodeDetailItems.includes(key) ||
                  (key === 'eventCount' && !stateExLabels.includes(viewNode['label'])) ||
                  (key === 'state' && !stateExLabels.includes(viewNode['label']))
              "
            >
              <span class="item-title">{{ key }} :</span>
              <span class="item-content">
                {{ value }}
                <!-- 复制按钮 -->
                <span v-if="key === 'id'" class="item-btn" @click.prevent.stop="copyNodeId(value)" title="复制">
                  <svg class="icon sm vm copy-btn-icon">
                    <use xlink:href="#COPY-GRAY"></use>
                  </svg>
                </span>
                <!-- 查看事件按钮 -->
                <!-- @todo: 查看事件 -->
                <span v-if="key === 'eventCount'" class="item-btn" @click.prevent.stop="showEvents()" title="查看事件">
                  <!-- <span v-if="false" class="item-btn" @click.prevent.stop="showEvents()" title="查看事件"> -->
                  <svg class="icon sm vm event-btn-icon">
                    <use xlink:href="#DETAIL-PAGE-GRAY"></use>
                  </svg>
                </span>
              </span>
            </div>
          </div>
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
        <!-- 查看事件列表 -->
        <el-drawer class="events-drawer" title="事件列表" :visible.sync="isShowEvents" direction="rtl" size="720px">
          <node-events v-if="isShowEvents" :viewNodeId="viewNode.id" />
        </el-drawer>
        <!-- 鼠标右键探索弹框 -->
        <el-dialog class="explore-dialog" :title="'确定探索该节点？'" :visible.sync="isShowExplore" width="30%">
          <div class="modes-wrapper">
            <div class="mw-item">
              <span class="item-title">节点ID：</span>
              <span class="item-content">{{ nodeToExplore.id }}</span>
            </div>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="isShowExplore = false">取 消</el-button>
            <el-button type="primary" @click="handleConfirmExplore">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 加载过程样式 -->
        <div class="main-topo-loading" v-show="isLoadingTopo">
          <svg class="icon loading">
            <use xlink:href="#spinner-light"></use>
          </svg>
        </div>
        <!-- 加载结果为空样式 -->
        <div class="main-topo-empty" v-show="topoViewData.nodes.length === 0 && !isLoadingTopo">
          暂无数据！
        </div>
        <!-- 搜索无匹配结果样式 -->
        <div class="main-topo-not-match" v-show="!isMatch && !isLoadingTopo && topoViewData.nodes.length > 0">
          无匹配节点！
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="js">
  import { dateFormat } from '@/utils/topo';

  import TopoDetail from './topo-detail.vue';
  import NodeDetail from './node-detail.vue';
  import NodeEvents from './node-events.vue';

  import * as utils from './d3-network/utils.js';
  import D3Network from './d3-network/vue-d3-network.vue';

  import './assets';

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
        options: {
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
        },
        settings: {
          maxLinks: 1,
          maxNodes: 36
        },
        nodeSym: null,
        foldTopoDetail: false,
        loading: true,
        scrollOptions: {
          className: "os-theme-light",
          resize: "none",
          // resize: "horizontal",
          sizeAutoCapable : true,
          paddingAbsolute : true,
          scrollbars : {
            clickScrolling : true,
            dragScrolling: true,
          }
        },
        showNodeDetail: false,
        nodeDetailItems: [
          'id',
          'name',
          'label',
          'createTime',
          'updateTime',
          'podIp',
          'nodeIp',
          'hostName',
          'processNo',
          'middlewareType',
          'kind',
        ],
        stateExLabels: [
          'Application',
          'MiddleWare',
          'Process',
        ],
        isShowExplore: false,
        isShowEvents: false,
        nodeToExplore: {},
        tickTimer: null,
      }
    },

    components: {
      TopoDetail,
      NodeDetail,
      NodeEvents,
      D3Network
    },

    computed: {
      durationRow() {
        return this.$store.state.rocketbot.durationRow;
      },
      isLoadingTopo() {
        return this.$store.state.rocketTopo.isLoadingTopo;
      },
      exploreNode() {
        return this.$store.state.rocketTopo.exploreNode;
      },
      topoMode() {
        return this.$store.state.rocketTopo.topoMode;
      },
      showNodeTypes() { // 左侧栏显示点类型过滤
        return this.$store.state.rocketTopo.showNodeTypes;
      },
      showStateTypes() { // 右上角点状态类型过滤
        return this.$store.state.rocketTopo.showStateTypes;
      },
      showEdgeTypes() { // 右上角显示边类型过滤
        return this.$store.state.rocketTopo.showEdgeTypes;
      },
      showRelativeTypes() { // 右上角关联点类型过滤
        return this.$store.state.rocketTopo.showRelativeTypes;
      },
      currentNode() { // 当前选中节点
        return this.$store.state.rocketTopo.currentNode;
      },
      viewNode() { // 当前查看节点
        return this.$store.state.rocketTopo.viewNode;
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
      this.initSvgSizeArg();
    },

    destroyed() {
      if (this.tickTimer) {
        clearTimeout(this.tickTimer);
        this.tickTimer = null;
      }
    },

    methods: {
      handleConfirmExplore() {
        this.isShowExplore = false;
        this.toolSetInstance.goToExploreNode(this.nodeToExplore);
        this.nodeToExplore = {};
      },
      copyNodeId(id) {
        const input = document.createElement('input');
        document.body.appendChild(input)
        input.setAttribute('value', id);
        input.select()
        if (document.execCommand('copy')) {
          document.execCommand('copy')
        }
        document.body.removeChild(input);
      },
      showEvents() {
        this.isShowEvents = true;
      },
      toggleNodeDetail(state) {
        this.showNodeDetail = state;
      },
      changeTopoViewData(newTopoViewData) {
        this.$emit('changeTopoViewData', newTopoViewData);
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
    },
  };
</script>
<style lang="scss">
  .topo-view-chart {
    position: absolute;
    top: 2px;
    left: 220px;
    right: 0;
    bottom: 2px;
    background-color: #333840;
    text-align: center;

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

        .tvcl-close {
          position: absolute;
          top: 0;
          right: 0;
          width: 20px;
          height: 100%;

          .tvclc-icon {
            position: absolute;
            top: 10px;
            right: 5px;
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

        .main-topo-info {
          position: absolute;
          left: 2px;
          padding: 5px 5px;
          border-radius: 2px;
          background-color: #242424;
          display: flex;
          flex-direction: column;
          color: #ccc;
          background: transparent;
          opacity: 0.8;
          z-index: 8900;
          pointer-events: none;

          .mti-item {
            padding: 2px 0px;
            text-align: left;
          }

          .view-node-info {
            margin-top: 20px;
            .info-title {
              color: deepskyblue;
            }

            .info-item {
              height: 20px;
              display: flex;
              justify-content: flex-start;
              align-items: center;
              color: #ccc;

              .item-title {
                margin-right: 8px;
                text-align: left;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }

              .item-content {
                // flex-grow: 1;
                text-align: left;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                display: flex;
                align-items: center;

                .item-btn {
                  color: #ddd;
                  font-size: 10px;
                  cursor: pointer;
                  pointer-events: all;

                  .copy-btn-icon {
                    width: 20px;
                    height: 20px;
                  }

                  .event-btn-icon {
                    width: 22px;
                    height: 22px;
                  }

                  &:active {
                    color: rgb(63, 177, 227);
                  }
                }
              }
            }
          }
        }
        .events-drawer {
          /deep/ :focus {
            outline: 0;
          }
          .el-drawer {
            overflow-y: auto !important;
            background-color: #252a2f;

            .el-drawer__header {
              text-align: left;
              color: #ddd;
              font-size: 16px;
              font-weight: 500;
            }
          }

          .el-drawer__body {
            padding: 0 20px;
          }

          .table-wrapper {
            width: 100%;
            overflow: hidden;
            border-right: solid 1px #ebeef5;

            .events-table {
              margin-left: 2px;

              .cell {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }

              .el-table__expanded-cell {
                padding: 20px 20px !important;

                .el-form-item__content {
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
              }

              .events-table-expand {
                font-size: 0;
              }
              .events-table-expand label {
                width: 90px;
                color: #99a9bf;
              }
              .events-table-expand .el-form-item {
                margin-right: 0;
                margin-bottom: 0;
                width: 100%;
              }
            }
          }
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
