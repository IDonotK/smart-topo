<template>
  <div class="topo-view-chart">
    <div id="tvccId" class="tvc-c">
      <div class="tvc-l">
        <!-- <TopoDetail
          v-if="currentNode && currentNode.id !== undefined && currentNode.id !== '' && currentNode.id !== null"
        /> -->
        <div class="tvcl-close">
          <span class="tvclc-icon" @click="closeTopoDetail"></span>
        </div>
      </div>
      <div class="tvc-r" id="tvcrId" ref="tvcr">
        <d3-network
          ref="net"
          :net-nodes="nodes"
          :net-links="links"
          :selection="{ nodes: selected, links: linksSelected }"
          :options="options"
          :linkCb="linkCb"
          :node-sym="nodeSym"
          @node-click="nodeClick"
          @link-click="linkClick"
          @screen-shot="screenShotDone"
        />
      </div>
    </div>
  </div>
</template>
<script lang="js">
  import * as d3 from 'd3';
  import d3tip from 'd3-tip';

  import TopoDetail from './topo-detail.vue';

  import appIcon from './assets/types/app.png';
  import processIcon from './assets/types/process.png';
  import podIcon from './assets/types/pod.png';
  import nodeIcon from './assets/types/node.png';

  import * as utils from './d3-network/utils.js';
  import D3Network from './d3-network/vue-d3-network.vue';

  export default {
    props: {
      // topoData: {
      //   type: Object,
      //   default() {
      //     return {
      //       nodes: [],
      //       calls: [],
      //     };
      //   },
      // },
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

        lastNodeId: 0,
        lastLinkId: 0,
        settings: {
          maxLinks: 1,
          maxNodes: 36
        },
        nodeSym: null,
        current: {}
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

    methods: {
      initSvgSizeArg() {
        this.options.size.w = this.$refs.tvcr.clientWidth;
        this.options.size.h = this.$refs.tvcr.clientHeight;
      },
      linkCb (link) {
        link.name = 'Link ' + link.id
        return link
      },
      nodeClick() {
        console.log('node click');
      },
      linkClick() {
        console.log('link click');
      },
      screenShotDone() {

      },

      closeTopoDetail() {
        this.$store.commit('rocketTopo/SET_NODE', {});
      },

      setCurrent(d) {
        this.current = d;
        this.$store.commit('SET_CURRENT_SERVICE', d);
      },

      reset() {
        this.selected = {};
        this.linksSelected = {};
        this.nodes = utils.makeRandomNodes(this.settings.maxNodes);
        this.lastNodeId = this.nodes.length + 1;
        this.links = utils.makeRandomLinks(this.nodes, this.settings.maxLinks);
        this.lastLinkId = this.links.length + 1;
      }
    },

    created() {
      // this.reset();
    },

    mounted() {
      this.initSvgSizeArg();
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
          top: 10px;
          right: 15px;

          .tvclc-icon {
            cursor: pointer;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 16px 12px 16px 0;
            border-color: transparent #ccc transparent transparent;
            display: block;
            z-index: 2;
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
