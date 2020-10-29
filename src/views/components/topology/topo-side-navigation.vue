<template>
  <div class="topo-side-nav">
    <div class="tsn-item" v-for="(item, index) in navList" :key="index"
      :class="{'tsni-odd': index % 2 != 0, 'tsni-even': index % 2 == 0, 'tsni-select': item.id == selectNav}"
      @click="handleSelectNav(item.id)">
      <div class="tsni-h">
        <img :src="item.imgUrl" alt="" width="20" height="20">
        {{item.name}}
      </div>
      <div class="tsni-count">
        <span class="tsnic-event" v-show="item.event > 0">{{item.event}}</span>
        <span v-show="item.event > 0">/</span>
        <span class="tsnic-total">{{item.total}}</span>
      </div>
    </div>
  </div>
</template>

<script lang="js">

  import allIcon from './assets/types/all.png';
  import appIcon from './assets/types/app.png';
  import processIcon from './assets/types/process.png';
  import podIcon from './assets/types/pod.png';
  import nodeIcon from './assets/types/node.png';

  export default {
    data() {
      return {
        navList: [
          // {
          //   id: 'All',
          //   name: 'All',
          //   imgUrl: allIcon,
          //   event: 2,
          //   total: 10
          // },
          {
            id: 'App',
            name: 'Applications',
            imgUrl: appIcon,
            event: 1,
            total: 2
          },
          {
            id: 'Process',
            name: 'Processes',
            imgUrl: processIcon,
            event: 0,
            total: 4
          },
          {
            id: 'Pod',
            name: 'Pods',
            imgUrl: podIcon,
            event: 1,
            total: 2
          },
          {
            id: 'Node',
            name: 'Nodes',
            imgUrl: nodeIcon,
            event: 0,
            total: 2
          }
        ],
      }
    },

    computed: {
      selectNav() {
        return this.$store.state.rocketTopo.filterNodeType;
      }
    },

    methods: {
      handleSelectNav(itemId) {
        this.$store.commit('rocketTopo/SET_FILTER_NODE_TYPE', itemId);
      }
    }

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
      height: 25%;
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

        &::before, &::after {
          content: "";
          display: block;
          height: 23px;
          position: absolute;
          top: 0;
          -webkit-transform: skew(-55deg,0);
          -ms-transform: skew(-55deg,0);
          transform: skew(-55deg,0);
        }

        .tsnic-event {
          color: red;
        }
      }
    }
  }

</style>
