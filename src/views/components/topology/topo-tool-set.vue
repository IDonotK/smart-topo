<template>
  <div class="topo-tool-set">
    <!-- 搜索节点 -->
    <div class="search-wrapper">
      <input
        type="text"
        class="sw-input"
        v-model="inputId"
        placeholder="请输入节点ID"
        @keyup.prevent.enter="handleMouseUp"
      />
      <span class="sw-clear">
        <svg class="icon sm close" @click="handleClearInputId" v-if="inputId">
          <use xlink:href="#clear"></use>
        </svg>
      </span>
      <span class="sw-search">
        <svg class="topo-icon" aria-hidden="true" @click="handleSearchOnId">
          <use xlink:href="#icon-sousuo"></use>
        </svg>
      </span>
    </div>
    <!-- 缩放控制 -->
    <div class="size-controller">
      <svg class="topo-icon larger" aria-hidden="true" @click="handleEnlargeTopo">
        <use xlink:href="#icon-fangdajingfangda"></use>
      </svg>
      <svg class="topo-icon smaller" aria-hidden="true" @click="handleNarrowTopo">
        <use xlink:href="#icon-fangdajingsuoxiao"></use>
      </svg>
      <svg
        class="topo-icon restore"
        aria-hidden="true"
        @click.stop.prevent="handleRestoreTopo(false)"
        @dblclick.stop.prevent="handleRestoreTopo(true)"
      >
        <use xlink:href="#icon-huanyuan"></use>
      </svg>
    </div>
    <!-- 更多按钮 -->
    <div class="more-tool-btn">
      <svg class="topo-icon more" aria-hidden="true" @click="handleToggleMoreTool">
        <use xlink:href="#icon-gengduo"></use>
      </svg>
    </div>
    <!-- 工具集合 -->
    <div class="more-tool-wrapper" v-show="moreToolState">
      <!-- 隐藏节点类型 -->
      <div id="hideType" class="fw-item hide-type" v-show="showNodeTypeFilter === 'All'">
        <TopoSelect
          :wrapper="'hideType'"
          :hasSearch="false"
          :current="hideTypeOption.select"
          :data="hideTypeOption.data"
          :title="hideTypeOption.title"
          @onChoose="handleChangeHideType"
        />
      </div>
      <!-- 节点状态类型：非选中节点 -->
      <div id="stateType" class="fw-item state-type" v-show="currentNode.id === undefined">
        <TopoSelect
          :wrapper="'stateType'"
          :hasSearch="false"
          :current="stateTypeOption.select"
          :data="stateTypeOption.data"
          :title="stateTypeOption.title"
          @onChoose="handleChangeStateType"
        />
      </div>
      <!-- 显示边的类型 -->
      <div id="edgeType" class="fw-item edge-type" v-show="currentNode.id === undefined">
        <TopoSelect
          :wrapper="'edgeType'"
          :hasSearch="false"
          :current="edgeTypeOption.select"
          :data="edgeTypeOption.data"
          :title="edgeTypeOption.title"
          @onChoose="handleChangeEdgeType"
        />
      </div>
      <!-- 节点状态类型：已选中节点？ -->

      <!-- 关联节点类型 -->
      <div id="relativeType" class="fw-item relative-type" v-show="currentNode.id !== undefined">
        <TopoSelect
          :wrapper="'relativeType'"
          :hasSearch="false"
          :current="relativeTypeOption.select"
          :data="relativeTypeOption.data"
          :title="relativeTypeOption.title"
          @onChoose="handleChangeRelativeType"
        />
      </div>
    </div>
  </div>
</template>

<script lang="js">
  require('./assets/iconfont-toolset/iconfont.js');
  import TopoSelect from './topo-select.vue';

  import * as d3 from 'd3';

  export default {
    props: {
      topoDataFiltered: {
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
        inputId: '',
        moreToolState: false,
        hideTypeOption: {
          title: '隐藏节点类型',
          data: [
            {key: 0, label: 'None'},
            {key: 1, label: 'App'},
            {key: 2, label: 'Middleware'},
            {key: 3, label: 'Process'},
            {key: 4, label: 'Deployment'},
            {key: 5, label: 'Pod'},
            {key: 6, label: 'Node'}
          ],
          select: {key: 0, label: 'None'},
        },
        stateTypeOption: {
          title: '节点状态类型',
          data: [
            {key: 0, label: 'All'},
            {key: 1, label: 'Normal'},
            {key: 2, label: 'Event'}
          ],
          select: {key: 0, label: 'All'}
        },
        relativeTypeOption: {
          title: '关联节点类型',
          data: [
            {key: 0, label: 'Single Hop'},
            {key: 1, label: 'All Streams'},
            {key: 2, label: 'Up Stream'},
            {key: 3, label: 'Down Stream'},
          ],
          select: {key: 0, label: 'Single Hop'}
        },
        edgeTypeOption: {
          title: '显示边的类型',
          data: [
            {key: 0, label: 'All'},
            {key: 1, label: 'Tracing To'},
            {key: 2, label: 'Create On'},
          ],
          select: {key: 0, label: 'All'}
        },
        zoomTimes: 1,
      }
    },

    components: {
      TopoSelect
    },

    computed: {
      zoomController() {
        return this.$store.state.rocketTopo.zoomController;
      },
      currentNode() {
        return this.$store.state.rocketTopo.currentNode;
      },
      showNodeTypeFilter() {
        return this.$store.state.rocketTopo.showNodeTypeFilter;
      },
    },

    watch: {
      topoDataFiltered(newVal, oldVal) {
        console.log('topo-tool-set knows');
      },
      currentNode(newVal) {
        if (newVal.id !== undefined) {
          this.moreToolState = true;
        } else {
          this.moreToolState = false;
        }
      },
      showNodeTypeFilter(newVal) {
        this.restoreFilters();
      }
    },

    methods: {
      handleMouseUp() {
        this.handleSearchOnId();
      },
      handleSearchOnId() {
        if (this.inputId === '') {
          return;
        }
        let result = this.topoDataFiltered.nodes.find(node => String(node.id) === this.inputId);
        if (result === undefined) {
          console.log('Not Match');
        } else {
          if (result.type !== this.showNodeTypeFilter) {
            this.$store.commit('rocketTopo/SET_SHOW_NODE_TYPE_FILTER', result.type);
            let lastX = result.x;
            let lastY = result.y;
            let staticNum = 0;
            let tickTimer = setInterval(() => {
              if (parseInt(result.x) === parseInt(lastX) && parseInt(result.y) === parseInt(lastY)) { // 可放宽限制，加快速度
                staticNum++;
              } else {
                lastX = result.x;
                lastY = result.y;
                staticNum = 0;
              }
              if (staticNum > 10) {
                clearTimeout(tickTimer);
                this.$store.commit('rocketTopo/SET_NODE', result);
              }
            }, 10);
          } else {
            this.$store.commit('rocketTopo/SET_NODE', result);
          }
        }
      },

      handleClearInputId() {
        this.inputId = '';
      },

      handleEnlargeTopo() {
        if (this.zoomTimes < 1) {
          this.zoomTimes = Number((Number(this.zoomTimes.toFixed(1)) + 0.1).toFixed(1));
        } else if (this.zoomTimes >= 1) {
          this.zoomTimes = this.zoomTimes + 1;
        }
        if (this.zoomTimes > 10) {
          this.zoomTimes = this.zoomTimes - 1;
          return;
        }
        this.zoomController.scaleTo(d3.select('.net-svg').transition().duration(750), this.zoomTimes);
      },

      handleNarrowTopo() {
        if (this.zoomTimes <= 1) {
          this.zoomTimes = Number((Number(this.zoomTimes.toFixed(1)) - 0.1).toFixed(1));
        } else if (this.zoomTimes > 1) {
          this.zoomTimes = this.zoomTimes - 1;
        }
        if (this.zoomTimes < 0.1) {
          this.zoomTimes = Number((Number(this.zoomTimes.toFixed(1)) + 0.1).toFixed(1));
          return;
        }
        this.zoomController.scaleTo(d3.select('.net-svg').transition().duration(750), this.zoomTimes);
      },

      restoreFilters() {
        this.moreToolState = false;
        this.hideTypeOption.select = this.hideTypeOption.data[0];
        this.stateTypeOption.select = this.stateTypeOption.data[0];
        this.edgeTypeOption.select = this.edgeTypeOption.data[0];
        this.relativeTypeOption.select = this.relativeTypeOption.data[0];
        this.$store.commit('rocketTopo/SET_HIDE_NODE_TYPE_FILTER', 'None');
        this.$store.commit('rocketTopo/SET_NODE_STATE_TYPE_FILTER', 'All');
        this.$store.commit('rocketTopo/SET_SHOW_EDGE_TYPE_FILTER', 'All');
        this.$store.commit('rocketTopo/SET_RELATIVE_NODE_TYPE', 'Single Hop');
      },

      handleRestoreTopo(isBackToAll) {
        this.inputId = '';
        this.currentNode.fx = null;
        this.currentNode.fy = null;
        this.$store.commit('rocketTopo/SET_NODE', {});
        if (isBackToAll) {
          this.$store.commit('rocketTopo/SET_SHOW_NODE_TYPE_FILTER', 'All');
          this.restoreFilters();
        }
        d3.select('#netSvg')
          .transition().duration(750)
          .call(this.zoomController.transform, d3.zoomIdentity);
      },

      handleToggleMoreTool() {
        this.moreToolState = !this.moreToolState;
      },

      handleChangeHideType(select) {
        this.hideTypeOption.select = select;
        this.$store.commit('rocketTopo/SET_HIDE_NODE_TYPE_FILTER', select.label);
      },

      handleChangeStateType(select) {
        this.stateTypeOption.select = select;
        this.$store.commit('rocketTopo/SET_NODE_STATE_TYPE_FILTER', select.label);
      },

      handleChangeRelativeType(select) {
        this.relativeTypeOption.select = select;
        this.$store.commit('rocketTopo/SET_RELATIVE_NODE_TYPE', select.label);
      },

      handleChangeEdgeType(select) {
        this.edgeTypeOption.select = select;
        this.$store.commit('rocketTopo/SET_SHOW_EDGE_TYPE_FILTER', select.label);
      }
    }
  }
</script>

<style lang="scss">
  .topo-tool-set {
    position: absolute;
    right: 2px;
    top: 2px;
    height: 40px;
    padding-left: 10px;
    border-radius: 2px;
    background-color: #242424;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -khtml-user-select: none;
    user-select: none;

    .search-wrapper,
    .size-controller,
    .more-tool-btn {
      margin-right: 12px;
      height: 100%;
      display: flex;
      align-items: center;
    }

    .topo-icon {
      margin-right: 5px;
      width: 18px;
      height: 18px;
      overflow: hidden;
      fill: currentColor;
      color: #efeff1;

      &:hover {
        cursor: pointer;
      }

      &.restore {
        margin-right: 0px;
      }
    }

    .search-wrapper {
      position: relative;

      .sw-input {
        width: calc(100% - 4px);
        height: 32px;
        line-height: 32px;
        border: 0;
        background-color: #333840;
        // border: 1px solid  #eee;
        // background-color: transparent;
        color: #eee;
        outline: 0;
        padding: 4px 25px;
        border-radius: 4px;
      }

      span {
        height: 100%;
        display: flex;
        align-items: center;
        position: absolute;
        top: 0;
        color: #efeff1;
        font-size: 16px;

        svg {
          width: 16px;
          height: 16px;

          &:hover {
            cursor: pointer;
          }
        }
      }

      .sw-search {
        left: 5px;
      }

      .sw-clear {
        right: 10px;
      }
    }

    // .size-controller {

    // }

    .more-tool-btn {
      margin-right: 10px;
    }

    .more-tool-wrapper {
      position: absolute;
      top: 100%;
      right: 0;
      padding: 8px 10px;
      margin-top: 8px;
      width: 180px;
      background-color: #242424;
      border-radius: 2px;
      -webkit-box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);

      &:after {
        bottom: 100%;
        right: 15px;
        border: solid transparent;
        content: ' ';
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
        border-color: transparent;
        border-bottom-color: #242424;
        border-width: 8px;
        margin-right: 0;
      }

      .fw-item {
        width: 100%;
        color: #ddd;
        position: relative;
        z-index: 9998;
      }
    }
  }
</style>
