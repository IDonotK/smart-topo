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
        <div class="tsnic-item total">
          <span class="item-title" title="All">All : </span>
          <span class="item-content" :title="item.total">{{ item.total }}</span>
        </div>
        <div class="tsnic-item">
          <span class="item-title" title="All">Abnormal : </span>
          <span class="item-content abnormal-number" :title="item.abnormal">{{ item.abnormal }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="js">
  import * as d3 from 'd3';
  import $jq from 'jquery';

  import appIcon from './assets/APP.png';
  import middlewareIcon from './assets/MIDDLEWARE.png';
  import processIcon from './assets/PROCESS.png';
  import workloadIcon from './assets/WORKLOAD.png';
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
            abnormal: 0,
            total: 0
          },
          {
            id: 'Middleware',
            name: 'Middlewares',
            imgUrl: middlewareIcon,
            abnormal: 0,
            total: 0
          },
          {
            id: 'Process',
            name: 'Processes',
            imgUrl: processIcon,
            abnormal: 0,
            total: 0
          },
          {
            id: 'Workload',
            name: 'Workloads',
            imgUrl: workloadIcon,
            abnormal: 0,
            total: 0
          },
          {
            id: 'Pod',
            name: 'Pods',
            imgUrl: podIcon,
            abnormal: 0,
            total: 0
          },
          {
            id: 'Node',
            name: 'Nodes',
            imgUrl: nodeIcon,
            abnormal: 0,
            total: 0
          }
        ],
      }
    },

    computed: {
      topoScaleFix() {
        return this.$store.state.rocketTopo.topoScaleFix;
      },
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
      restoreTopoViewport() {
        let centerX = $jq('#netSvg').width() / 2;
        let centerY = $jq('#netSvg').height() / 2;
        let zoomK = d3.zoomTransform(d3.select('#zoomContainer').node()).k;

        if (zoomK > this.topoScaleFix) {
          this.zoomController.scaleTo(
            d3
              .select('.net-svg')
              .transition()
              .duration(500),
            this.topoScaleFix,
          );
          setTimeout(() => {
            this.zoomController.translateTo(
              d3
                .select('.net-svg')
                .transition()
                .duration(500),
              centerX,
              centerY,
            );
          }, 500);
        } else if (zoomK === this.topoScaleFix) {
          this.zoomController.translateTo(
            d3
              .select('.net-svg')
              .transition()
              .duration(500),
            centerX,
            centerY,
          );
        } else {
          this.zoomController.translateTo(
            d3
              .select('.net-svg')
              .transition()
              .duration(500),
            centerX,
            centerY,
          );
          setTimeout(() => {
            this.zoomController.scaleTo(
              d3
                .select('.net-svg')
                .transition()
                .duration(500),
              this.topoScaleFix,
            );
          }, 500);
        }
      },
      handleSelectNav(itemId) {
        if (itemId === this.showNodeTypeFilter) {
          return;
        }
        this.currentNode.fx = null;
        this.currentNode.fy = null;
        this.$store.commit('rocketTopo/SET_NODE', {});
        this.$store.commit('rocketTopo/SET_SHOW_NODE_TYPE_FILTER', itemId);
        this.restoreTopoViewport();
      },
      initNavList() {
        this.topoData.nodes.forEach(node => {
          let navItem = this.navList.find(item => item.id === node.type);
          if (navItem) {
            navItem.total++;
            if (node.state === 'Abnormal') {
              navItem.abnormal++;
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
          color: skyblue;
        }

        .tsni-count {
          color: skyblue;
        }
      }

      .tsni-h {
        font-size: 16px;
        color: #ccc;
        padding-bottom: 2px;
        display: flex;
        align-items: center;

        img {
          margin-right: 5px;
        }
      }

      .tsni-count {
        padding-top: 2px;
        color: #ccc;
        font-size: 14px;

        .abnormal-number {
          color: red;
        }
      }
    }
  }
</style>
