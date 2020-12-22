<template>
  <div class="topo-side-nav">
    <div
      class="tsn-item"
      v-for="(item, index) in navList"
      :key="index"
      :class="{ 'tsni-odd': index % 2 != 0, 'tsni-even': index % 2 == 0, 'tsni-select': item.id == currentNode.type }"
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
        <div class="tsnic-item" v-show="!['Application', 'MiddleWare', 'Process'].includes(item.id)">
          <span class="item-title" title="All">Abnormal : </span>
          <span class="item-content abnormal-number" :title="item.abnormal">{{ item.abnormal }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="js">
  import appIcon from './assets/png/APPLICATION.png';
  import middlewareIcon from './assets/png/MIDDLEWARE.png';
  import processIcon from './assets/png/PROCESS.png';
  import workloadIcon from './assets/png/WORKLOAD.png';
  import podIcon from './assets/png/POD.png';
  import nodeIcon from './assets/png/NODE.png';

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
            imgUrl: appIcon,
            abnormal: 0,
            total: 0
          },
          {
            id: 'MiddleWare',
            name: 'MiddleWares',
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
      currentNode() {
        return this.$store.state.rocketTopo.currentNode;
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
