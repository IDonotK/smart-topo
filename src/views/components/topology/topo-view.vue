<template>
  <div class="topo-view-chart">
    <div id="tvccId" class="tvc-c">
      <!-- 拓扑详情 -->
      <div class="tvc-l" id="tvclId">
        <overlay-scrollbars id="tdwId" style="height:100%" :options="scrollOptions" v-show="!foldTopoDetail">
          <TopoDetail
            v-if="currentNode && currentNode.id !== undefined"
            :topoDetailData="topoDetailData"
            :topoViewData="topoViewData"
          />
        </overlay-scrollbars>
        <div class="tvcl-close" v-if="currentNode && currentNode.id !== undefined">
          <span
            class="tvclc-icon"
            :class="{ 'tvlci-fold': foldTopoDetail }"
            @click.stop.prevent="toggleTopoDetail"
          ></span>
        </div>
      </div>
      <!-- 主拓扑图 -->
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
            <div class="info-item">
              <span class="item-title" title="id">id :</span>
              <span class="item-content" :title="viewNode.id">{{ viewNode.id }}</span>
            </div>
            <div class="info-item">
              <span class="item-title" title="name">name :</span>
              <span class="item-content" :title="viewNode.name">{{ viewNode.name }}</span>
            </div>
            <div class="info-item">
              <span class="item-title" title="label">label :</span>
              <span class="item-content" :title="viewNode.type">{{ viewNode.type }}</span>
            </div>
            <div class="info-item">
              <span class="item-title" title="state">state :</span>
              <span class="item-content" :title="viewNode.state">{{ viewNode.state }}</span>
            </div>
          </div>
        </div>
        <!-- 拓扑图 -->
        <d3-network
          v-show="topoViewData.nodes.length > 0 && isMatch"
          ref="net"
          :net-data="netData"
          :options="options"
          :node-sym="nodeSym"
          @node-dblclick="nodeDblClick"
          @node-click="nodeClick"
          @link-click="linkClick"
        />
        <!-- 加载样式 -->
        <div class="main-topo-loading" v-show="topoViewData.nodes.length === 0">
          <svg class="icon loading">
            <use xlink:href="#spinner-light"></use>
          </svg>
        </div>
        <!-- 搜索无匹配结果样式 -->
        <div class="main-topo-not-match" v-show="!isMatch">Not Match !</div>
      </div>
    </div>
  </div>
</template>
<script lang="js">
  import * as d3 from 'd3';
  import d3tip from 'd3-tip';

  import $jq from 'jquery';

  import TopoDetail from './topo-detail.vue';

  import appIcon from './assets/types/app.png';
  import processIcon from './assets/types/process.png';
  import podIcon from './assets/types/pod.png';
  import nodeIcon from './assets/types/node.png';

  import * as utils from './d3-network/utils.js';
  import D3Network from './d3-network/vue-d3-network.vue';

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
      }
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
        topoDetailData: {
          nodes: [],
          links: []
        },
        loading: true,
        scrollOptions: {
          className: "os-theme-light",
          resize: "none",
          sizeAutoCapable : true,
          paddingAbsolute : true,
          scrollbars : {
            clickScrolling : true,
            dragScrolling: true,
          }
        },
      }
    },

    components: {
      TopoDetail,
      D3Network
    },

    computed: {
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
      }
    },

    watch: {
      topoViewData(newVal, oldVal) {
        console.log('topoViewData change in topo-view: ', newVal);
        this.initNetTopoData();
      },
      currentNode(newVal, oldVal) {
        if (newVal.id !== undefined) {
          this.foldTopoDetail = false;
          // 根据选中的节点过滤拓扑数据
          this.resetTopoDetailData(newVal);
        } else {
          this.topoDetailData = {
            nodes: [],
            links: []
          };
          console.log('topoDetailData to zero in topo-view: ', this.topoDetailData);
          this.foldTopoDetail = true;
        }
      }
    },

    created() {
      this.initNetTopoData();
      // this.reset(); // 拓扑布局测试
    },

    mounted() {
      this.initSvgSizeArg();
    },

    methods: {
      changeTopoViewData(newTopoViewData) {
        this.$emit('changeTopoViewData', newTopoViewData);
      },
      setCurNodeStably(curNode) {
        let lastX = curNode.x;
        let lastY = curNode.y;
        let staticNum = 0;
        let tickTimer = setInterval(() => {
          if (parseInt(curNode.x) === parseInt(lastX) && parseInt(curNode.y) === parseInt(lastY)) { // 可放宽限制，加快速度
            staticNum++;
          } else {
            lastX = curNode.x;
            lastY = curNode.y;
            staticNum = 0;
          }
          if (staticNum > 10) {
            clearTimeout(tickTimer);
            this.$store.commit('rocketTopo/SET_NODE', curNode);
          }
        }, 10);
      },
      resetTopoDetailData(curNode) {
        // query
        const nodesTmp = new Set();
        const linksTmp = new Set();
        this.deepSearchTopoUp(curNode, this.topoViewData, nodesTmp, linksTmp);
        this.deepSearchTopoDown(curNode, this.topoViewData, nodesTmp, linksTmp);
        // 注意顺序: 选中节点 => 上游节点 => 下游节点,集中在topoDetailData的尾部
        nodesTmp.add(curNode);
        this.searchStreamOnSingleHop(curNode, this.topoViewData, nodesTmp, linksTmp);

        this.topoDetailData = {
          nodes: Array.from(nodesTmp),
          links: Array.from(linksTmp)
        };
      },
      searchStreamOnSingleHop(curNode, topoData, nodeSet, linkSet) {
        // query
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
      deepSearchTopoUp(curNode, topoData, nodeSet, linkSet) {
        for (let i = 0; i < topoData.links.length; i++) { // 基于全局的拓扑数据
          let link = topoData.links[i];
          if (link.tid === curNode.id) {
            if (link.source.type === curNode.type) {
              continue;
            }
            linkSet.add(link);
            nodeSet.add(link.source);
            this.deepSearchTopoUp(link.source, topoData, nodeSet, linkSet);
          }
        }
      },
      deepSearchTopoDown(curNode, topoData, nodeSet, linkSet) {
        for (let i = 0; i < topoData.links.length; i++) { // 基于全局的拓扑数据
          let link = topoData.links[i];
          if (link.sid === curNode.id) {
            if (link.target.type === curNode.type) {
              continue;
            }
            linkSet.add(link);
            nodeSet.add(link.target);
            this.deepSearchTopoDown(link.target, topoData, nodeSet, linkSet);
          }
        }
      },
      initSvgSizeArg() {
        this.options.size.w = this.$refs.tvcr.clientWidth;
        this.options.size.h = this.$refs.tvcr.clientHeight;
      },
      initNetTopoData() {
        this.netData = this.topoViewData;
      },
      nodeDblClick(event, node) {
        if (node && this.currentNode && node.id === this.currentNode.id) {
          return;
        }
        if (event && node) {
          this.setCurNodeStably(node);
          // this.$store.commit('rocketTopo/SET_NODE', node);
        }
      },
      nodeClick(event, node) {
        this.$store.commit('rocketTopo/SET_VIEW_NODE', node);
      },
      linkClick() {},
      toggleTopoDetail() {
        this.foldTopoDetail = !this.foldTopoDetail;
      },
      reset () {
        this.selected = {}
        this.linksSelected = {}
        this.nodes = utils.makeRandomNodes(this.settings.maxNodes)
        this.lastNodeId = this.nodes.length + 1
        this.links = utils.makeRandomLinks(this.nodes, this.settings.maxLinks)
        this.lastLinkId = this.links.length + 1
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

        .topo-detail-wrapper {
          -webkit-transition: 0.1s width;
          transition: 0.1s width;
          height: 100%;
        }

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

          .mti-item {
            padding: 2px 0px;
            text-align: left;
          }

          .view-node-info {
            margin-top: 20px;
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
                flex-grow: 1;
                text-align: left;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            }
          }
        }

        .main-topo-loading {
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
        .main-topo-not-match {
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
