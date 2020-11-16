<template>
  <div class="topo-side-nav">
    <div
      class="tsn-item"
      v-for="(item, index) in navList"
      :key="index"
      :class="{ 'tsni-odd': index % 2 != 0, 'tsni-even': index % 2 == 0, 'tsni-select': item.id == showNodeTypeFilter }"
      @click="handleSelectNav(item.id)"
    >
      <div class="tsni-h">
        <img :src="item.imgUrl" alt="" width="20" height="20" />
        {{ item.name }}
      </div>
      <div class="tsni-count">
        <span class="tsnic-event" v-show="item.event > 0">{{ item.event }}</span>
        <span v-show="item.event > 0">/</span>
        <span class="tsnic-total">{{ item.total }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="js">
  import * as d3 from 'd3';

  import appIcon from './assets/APP.png';
  import middlewareIcon from './assets/MIDDLEWARE.png';
  import processIcon from './assets/PROCESS.png';
  import deploymentIcon from './assets/DEPLOYMENT.png';
  import podIcon from './assets/POD.png';
  import nodeIcon from './assets/NODE.png';

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
        navList: [
          {
            id: 'App',
            name: 'Applications',
            imgUrl: appIcon,
            event: 0,
            total: 0
          },
          {
            id: 'Middleware',
            name: 'Middlewares',
            imgUrl: middlewareIcon,
            event: 0,
            total: 0
          },
          {
            id: 'Process',
            name: 'Processes',
            imgUrl: processIcon,
            event: 0,
            total: 0
          },
          {
            id: 'Deployment',
            name: 'Deployments',
            imgUrl: deploymentIcon,
            event: 0,
            total: 0
          },
          {
            id: 'Pod',
            name: 'Pods',
            imgUrl: podIcon,
            event: 0,
            total: 0
          },
          {
            id: 'Node',
            name: 'Nodes',
            imgUrl: nodeIcon,
            event: 0,
            total: 0
          }
        ],
      }
    },

    computed: {
      showNodeTypeFilter() {
        return this.$store.state.rocketTopo.showNodeTypeFilter;
      },
      currentNode() {
        return this.$store.state.rocketTopo.currentNode;
      },
      zoomController() {
        return this.$store.state.rocketTopo.zoomController;
      },

    },

    watch: {
      topoData() {
        this.initNavList();
      }
    },

    mounted() {
      this.initNavList();
    },

    methods: {
      handleSelectNav(itemId) {
        if (itemId === this.showNodeTypeFilter) {
          return;
        }
        this.currentNode.fx = null;
        this.currentNode.fy = null;
        this.$store.commit('rocketTopo/SET_NODE', {});
        this.$store.commit('rocketTopo/SET_SHOW_NODE_TYPE_FILTER', itemId);
        d3.select('#netSvg')
          .transition().duration(750)
          .call(this.zoomController.transform, d3.zoomIdentity);
      },
      initNavList() {
        this.topoData.nodes.forEach(node => {
          let navItem = this.navList.find(item => item.id === node.type);
          if (navItem) {
            navItem.total++;
            if (node.state === 'Event') {
              navItem.event++;
            }
          }
        });
      }
    },

  }
</script>

<style lang="scss" scoped>
  .topo-side-nav {
    position: absolute;
    left: 0;
    top: 2px;
    bottom: 2px;
    width: 220px;
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;

    .tsn-item {
      width: 100%;
      height: 16.66%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0 48px 0 30px;
      cursor: pointer;

      &.tsni-odd {
        background-color: #252a2f;
      }

      &.tsni-even {
        background-color: #242424;
      }

      &.tsni-select {
        background-color: #333840 !important;

        .tsni-h {
          color: skyblue !important;
        }

        .tsni-count::before {
          background-color: skyblue !important;
        }
      }

      .tsni-h {
        font-size: 16px;
        color: #ccc;
        padding-bottom: 6px;
        display: flex;
        align-items: center;

        img {
          margin-right: 5px;
        }
      }

      .tsni-count {
        text-align: right;
        padding-top: 9px;
        color: #ccc;
        font-size: 14px;
        position: relative;

        &::before {
          width: 30px;
          left: 13px;
          background-color: #ccc;
        }

        &::after {
          border-top: 1px solid #ccc;
          border-left: 2px solid #ccc;
          left: 49px;
          right: 13px;
        }

        &::before,
        &::after {
          content: '';
          display: block;
          height: 23px;
          position: absolute;
          top: 0;
          -webkit-transform: skew(-55deg, 0);
          -ms-transform: skew(-55deg, 0);
          transform: skew(-55deg, 0);
        }

        .tsnic-event {
          color: red;
        }
      }
    }
  }
</style>
