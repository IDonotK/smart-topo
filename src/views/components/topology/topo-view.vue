<template>
  <div class="topo-view-chart">
    <div id="tvccId" class="tvc-c">
      <!-- 拓扑详情 -->
      <div class="tvc-l" id="tvcl">
        <TopoDetail
          v-if="currentNode && currentNode.id !== undefined"
          :foldTopoDetail="foldTopoDetail"
          :topoDetailData="topoDetailData"
          :topoData="topoData"
          @changeTopoViewData="changeTopoViewData"
        />
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
        <div class="main-topo-title" v-show="topoViewData.nodes.length > 0 && isMatch">
          <div class="mtt-item current-node" v-show="currentNode.id !== undefined">
            <span class="title">选中节点的名称：</span>
            <span class="content">{{ currentNode.name }}</span>
          </div>
          <div class="mtt-item relative-node-type" v-show="currentNode.id !== undefined">
            <span class="title">选中节点的关联节点类型：</span>
            <span class="content">{{ relativeNodeType }}</span>
          </div>
          <div class="mtt-item show-node-type" v-show="showNodeTypeFilter !== 'All'">
            <span class="title">显示的节点类型：</span>
            <span class="content">{{ showNodeTypeFilter }}</span>
          </div>
          <div class="mtt-item hide-node-tydepe" v-show="showNodeTypeFilter === 'All'">
            <span class="title">隐藏的节点类型：</span>
            <span class="content">{{ hideNodeTypeFilter }}</span>
          </div>
          <div class="mtt-item node-state-type">
            <span class="title">显示的节点状态：</span>
            <span class="content">{{ nodeStateTypeFilter }}</span>
          </div>
          <div class="mtt-item show-edge-type">
            <span class="title">显示的边类型：</span>
            <span class="content">{{ showEdgeTypeFilter }}</span>
          </div>
        </div>
        <d3-network
          v-show="topoViewData.nodes.length > 0 && isMatch"
          ref="net"
          :net-nodes="nodes"
          :net-links="links"
          :options="options"
          :node-sym="nodeSym"
          @node-click="nodeClick"
          @link-click="linkClick"
        />
        <div class="main-topo-loading" v-show="topoViewData.nodes.length === 0">
          <svg class="icon loading">
            <use xlink:href="#spinner-light"></use>
          </svg>
        </div>
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
        nodes: [],
        links: [],
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
      }
    },

    components: {
      TopoDetail,
      D3Network
    },

    computed: {
      hasSearchedGlobally() {
        return this.$store.state.rocketTopo.hasSearchedGlobally;
      },
      showNodeTypeFilter() { // 左侧栏显示点类型过滤
        return this.$store.state.rocketTopo.showNodeTypeFilter;
      },
      hideNodeTypeFilter() { // 右上角隐藏点类型过滤
        return this.$store.state.rocketTopo.hideNodeTypeFilter;
      },
      nodeStateTypeFilter() { // 右上角点状态类型过滤
        return this.$store.state.rocketTopo.nodeStateTypeFilter;
      },
      showEdgeTypeFilter() { // 右上角显示边类型过滤
        return this.$store.state.rocketTopo.showEdgeTypeFilter;
      },
      relativeNodeType() { // 右上角关联点类型过滤
        return this.$store.state.rocketTopo.relativeNodeType;
      },
      currentNode() { // 当前选中节点
        return this.$store.state.rocketTopo.currentNode;
      },
    },

    watch: {
      topoData(newVal, oldVal) {
        // 重绘纵向关系
      },
      topoViewData(newVal, oldVal) {
        this.initNetTopoData();
      },
      currentNode(newVal, oldVal) {
        if (newVal.id !== undefined) {
          this.foldTopoDetail = false;
          // 根据选中的节点过滤拓扑数据
          this.resetTopoDetailData(newVal);
        } else {
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
        nodesTmp.add(curNode);
        this.deepSearchTopoUp(curNode, nodesTmp, linksTmp);
        this.deepSearchTopoDown(curNode, nodesTmp, linksTmp);
        this.searchStreamOnSingleHop(curNode, nodesTmp, linksTmp);

        this.topoDetailData = {
          nodes: Array.from(nodesTmp),
          links: Array.from(linksTmp)
        };
      },
      searchStreamOnSingleHop(curNode, nodeSet, linkSet) {
        const nodesTmpUp = new Set();
        const linksTmpUp = new Set();
        const nodesTmpDown = new Set();
        const linksTmpDown = new Set();
        this.topoData.links.forEach(link => {
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
      deepSearchTopoUp(curNode, nodeSet, linkSet) {
        for (let i = 0; i < this.topoData.links.length; i++) { // 基于全局的拓扑数据
          let link = this.topoData.links[i];
          if (link.tid === curNode.id) {
            if (link.source.type === curNode.type) {
              continue;
            }
            linkSet.add(link);
            nodeSet.add(link.source);
            this.deepSearchTopoUp(link.source, nodeSet, linkSet);
          }
        }
      },
      deepSearchTopoDown(curNode, nodeSet, linkSet) {
        for (let i = 0; i < this.topoData.links.length; i++) { // 基于全局的拓扑数据
          let link = this.topoData.links[i];
          if (link.sid === curNode.id) {
            if (link.target.type === curNode.type) {
              continue;
            }
            linkSet.add(link);
            nodeSet.add(link.target);
            this.deepSearchTopoDown(link.target, nodeSet, linkSet);
          }
        }
      },
      initSvgSizeArg() {
        this.options.size.w = this.$refs.tvcr.clientWidth;
        this.options.size.h = this.$refs.tvcr.clientHeight;
      },
      initNetTopoData() {  // 浅拷贝
        this.nodes = this.topoViewData.nodes;
        this.links = this.topoViewData.links;
      },
      nodeClick(event, node) {
        if (node && this.currentNode && node.id === this.currentNode.id) {
          return;
        }
        if (event && node) {
          if (this.hasSearchedGlobally) {
            this.$store.commit('rocketTopo/SET_IS_GLOBAL_MODE', false);
            this.$store.commit('rocketTopo/SET_HAS_SEARCHED_GLOBALLY', false);
            this.$store.commit('rocketTopo/SET_IS_FROM_GLOBAL_TO_NORMAL', true);
            // 重置topoViewData
            let topoViewData = this.topoData;
            this.$emit('changeTopoViewData', topoViewData);
            // 重置过滤器
            this.$emit('restoreFilters');
            this.$store.commit('rocketTopo/SET_SHOW_NODE_TYPE_FILTER', node.type);
            this.setCurNodeStably(node);
          } else {
            if (node.type !== this.showNodeTypeFilter) {
              this.$store.commit('rocketTopo/SET_SHOW_NODE_TYPE_FILTER', node.type);
              this.setCurNodeStably(node);
            } else {
              this.$store.commit('rocketTopo/SET_NODE', node);
            }
          }
        }
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

        .main-topo-title {
          position: absolute;
          left: 2px;
          padding: 5px 5px;
          border-radius: 2px;
          background-color: #242424;
          display: flex;
          flex-direction: column;
          color: #ccc;
          z-index: 8888;
          background: transparent;
          opacity: 0.8;

          .mtt-item {
            padding: 2px 0px;
            text-align: left;
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
