<template>
  <div class="topo-side-nav">
    <div
      class="tsn-item"
      v-for="(item, index) in navList"
      :key="index"
      :class="{ 'tsni-odd': index % 2 != 0, 'tsni-even': index % 2 == 0, 'tsni-select': item.id == currentNode.type }"
      @click="handleClickSideNav(item.id)"
    >
      <div class="tsni-h">
        <svg alt="" width="20" height="20">
          <use :xlink:href="'#' + item.id.toUpperCase()"></use>
        </svg>
        {{ item.name }}
      </div>
      <div class="tsni-count">
        <div class="tsnic-item total">
          <span class="item-title" title="All">All : </span>
          <span class="item-content" :title="item.total">{{ item.total }}</span>
        </div>
        <div class="tsnic-item" v-show="!['Application', 'MiddleWare', 'Process'].includes(item.id)">
          <span class="item-title" title="All">Abnormal : </span>
          <span class="item-content abnormal-number" :title="item.abnormal">{{ item.abnormal }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="js">
  export default {
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
    },

    data() {
      return {
        navList: [
          {
            id: 'Application',
            name: 'Applications',
            abnormal: 0,
            total: 0
          },
          {
            id: 'MiddleWare',
            name: 'MiddleWares',
            abnormal: 0,
            total: 0
          },
          {
            id: 'Process',
            name: 'Processes',
            abnormal: 0,
            total: 0
          },
          {
            id: 'Workload',
            name: 'Workloads',
            abnormal: 0,
            total: 0
          },
          {
            id: 'Pod',
            name: 'Pods',
            abnormal: 0,
            total: 0
          },
          {
            id: 'Node',
            name: 'Nodes',
            abnormal: 0,
            total: 0
          }
        ],
      }
    },

    computed: {
      currentNode() {
        return this.$store.state.rocketTopo.currentNode;
      },
      toolSetInstance() {
        return this.$store.state.rocketTopo.toolSetInstance;
      },
    },

    watch: {
      topoViewData() {
        this.initNavList();
      }
    },

    mounted() {
      this.initNavList();
    },

    methods: {
      handleClickSideNav(type) {
        this.toolSetInstance.resetIsAutoReloadTopo();
        this.toolSetInstance.setNodeTypesFilter(type);
      },
      initNavList() {
        this.navList.forEach(nav => {
          nav.total = 0;
          nav.abnormal = 0;
        });
        this.topoViewData.nodes.forEach(node => {
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

      &:active {
        background-color: #333840 !important;
      }

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

        svg {
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
