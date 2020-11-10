<template>
  <div class="topo-view-chart">
    <div id="tvccId" class="tvc-c">
      <div class="tvc-l" id="tvcl">
        <TopoDetail v-if="currentNode && currentNode.id !== undefined" :foldTopoDetail="foldTopoDetail" />
        <div class="tvcl-close" v-if="currentNode && currentNode.id !== undefined">
          <span
            class="tvclc-icon"
            :class="{ 'tvlci-fold': foldTopoDetail }"
            @click.stop.prevent="toggleTopoDetail"
          ></span>
        </div>
      </div>
      <div class="tvc-r" id="tvcrId" ref="tvcr">
        <d3-network
          ref="net"
          :net-nodes="nodes"
          :net-links="links"
          :options="options"
          :node-sym="nodeSym"
          @node-click="nodeClick"
          @link-click="linkClick"
        />
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
      }
    },

    components: {
      TopoDetail,
      D3Network
    },

    computed: {
      currentNode() {
        return this.$store.state.rocketTopo.currentNode;
      },
    },

    watch: {
      topoData(newVal, oldVal) {
        console.log('topo-view knows');
        this.initTopoData(); // 可优化，考虑props
      }
    },

    mounted() {
      this.initSvgSizeArg();
      this.initTopoData();
      // this.reset(); // 拓扑布局测试
    },

    methods: {
      initSvgSizeArg() {
        this.options.size.w = this.$refs.tvcr.clientWidth;
        this.options.size.h = this.$refs.tvcr.clientHeight;
      },
      initTopoData() {
        this.nodes = this.topoData.nodes;
        this.links = this.topoData.links;
      },
      nodeClick() {},
      linkClick() {},
      toggleTopoDetail() {
        this.foldTopoDetail = !this.foldTopoDetail;
        // if (this.foldTopoDetail) {
        //   $jq('#tvcl').css('width', '20px');
        // } else {
        //   $jq('#tvcl').css('width', 'auto');
        // }
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
            z-index: 9999;
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
      }
    }
  }
</style>
