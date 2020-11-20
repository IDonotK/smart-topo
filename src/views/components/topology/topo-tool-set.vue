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
    <div class="global-search-ctrl">
      <input id="gscCheckbox" type="checkbox" v-model="isGlobalSearch" @click="handleClickCheckbox($event)" />
      <label for="gscCheckbox">全局</label>
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
        @click.stop.prevent="handleRestoreTopo"
        @dblclick.stop.prevent="handleRestoreTopoToOrigin"
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
  import $jq from 'jquery';

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
        isGlobalSearch: false, // 仅用于控制勾选框的状态样式
        moreToolState: false,
        hideTypeOption: {
          title: '隐藏节点类型',
          data: [
            {key: 0, label: 'None'},
            {key: 1, label: 'App'},
            {key: 2, label: 'Middleware'},
            {key: 3, label: 'Process'},
            {key: 4, label: 'Workload'},
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
            {key: 2, label: 'Abnormal'}
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
        nodeSingleClickTimer: null,
      }
    },

    components: {
      TopoSelect
    },

    computed: {
      hasSearchedGlobally() {
        return this.$store.state.rocketTopo.hasSearchedGlobally;
      },
      isGlobalMode() {
        return this.$store.state.rocketTopo.isGlobalMode;
      },
      topoScaleFix() {
        return this.$store.state.rocketTopo.topoScaleFix;
      },
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
      isGlobalMode(newVal) {
        this.isGlobalSearch = newVal;
      },
      topoDataFiltered(newVal, oldVal) {

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
      handleClickCheckbox(e) {
        this.$store.commit('rocketTopo/SET_IS_GLOBAL_MODE', e.target.checked);
      },
      handleMouseUp() {
        this.handleSearchOnId();
      },
      handleSearchOnId() {
        if (this.inputId === '') {
          return;
        }
        let result = {};
        if (this.isGlobalMode) { // 搜索全拓扑
          result = this.topoData.nodes.find(node => String(node.id) === this.inputId);
          if (result === undefined) {
            this.$emit('onSearchResult', false);
          } else {
            // 已在全局模式下搜索到结果
            this.$store.commit('rocketTopo/SET_HAS_SEARCHED_GLOBALLY', true);

            // 查询目标节点的全部上下游节点，每个节点都不一样，每次都需要重新布局
            let topoViewData = {
              nodes: [],
              links: []
            };
            topoViewData.nodes = this.topoData.nodes.filter(node => node.type === result.type);
            topoViewData.links = this.topoData.links.filter(link =>
              link.source.type === result.type && link.target.type === result.type
            );
            this.$emit('changeTopoViewData', topoViewData);
            if (result.type !== this.showNodeTypeFilter) {
              this.$store.commit('rocketTopo/SET_SHOW_NODE_TYPE_FILTER', result.type);
            }
            this.setCurNodeStably(result);
          }
        } else { // 搜索当前拓扑
          result = this.topoDataFiltered.nodes.find(node => String(node.id) === this.inputId);
          if (result === undefined) {
            this.$emit('onSearchResult', false);
          } else {
            this.$emit('onSearchResult', true);
            if (this.hasSearchedGlobally) {
              this.$store.commit('rocketTopo/SET_IS_GLOBAL_MODE', false);
              this.$store.commit('rocketTopo/SET_HAS_SEARCHED_GLOBALLY', false);
              // this.$store.commit('rocketTopo/SET_IS_FROM_GLOBAL_TO_NORMAL', true);
              // 重置topoViewData
              let topoViewData = this.topoData;
              this.$emit('changeTopoViewData', topoViewData);
              // 重置过滤器
              this.$emit('restoreFilters');
              this.$store.commit('rocketTopo/SET_SHOW_NODE_TYPE_FILTER', result.type);
              this.setCurNodeStably(result);
            } else {
              if (result.type !== this.showNodeTypeFilter) {
                this.$store.commit('rocketTopo/SET_SHOW_NODE_TYPE_FILTER', result.type);
                this.setCurNodeStably(result);
              } else {
                this.$store.commit('rocketTopo/SET_NODE', result);
              }
            }
          }
        }
      },

      handleClearInputId() {
        this.inputId = '';
        this.$emit('onSearchResult', true);
      },

      handleEnlargeTopo() {
        let zoomTimes = d3.zoomTransform(d3.select('#zoomContainer').node()).k;
        if (zoomTimes < 1) {
          zoomTimes = Number((Number(zoomTimes.toFixed(1)) + 0.1).toFixed(1));
        } else if (zoomTimes >= 1) {
          zoomTimes = zoomTimes + 1;
        }
        if (zoomTimes > 100) {
          zoomTimes = zoomTimes - 1;
          return;
        }
        this.zoomController.scaleTo(d3.select('.net-svg').transition().duration(750), zoomTimes);
      },

      handleNarrowTopo() {
        let zoomTimes = d3.zoomTransform(d3.select('#zoomContainer').node()).k;
        if (zoomTimes <= 1) {
          zoomTimes = Number((Number(zoomTimes.toFixed(1)) - 0.1).toFixed(1));
        } else if (zoomTimes > 1) {
          zoomTimes = zoomTimes - 1;
        }
        if (zoomTimes < 0.1) {
          zoomTimes = Number((Number(zoomTimes.toFixed(1)) + 0.1).toFixed(1));
          return;
        }
        this.zoomController.scaleTo(d3.select('.net-svg').transition().duration(750), zoomTimes);
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

      restoreTopoViewPort() {
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

      handleRestoreTopo() {
        if (this.nodeSingleClickTimer !== null) {
          clearTimeout(this.nodeSingleClickTimer);
          this.nodeSingleClickTimer = null;
          return;
        }
        this.nodeSingleClickTimer = setTimeout(() => {
          this.nodeSingleClickTimer = null;
          this.inputId = '';
          this.currentNode.fx = null;
          this.currentNode.fy = null;
          this.$store.commit('rocketTopo/SET_NODE', {});
          this.restoreTopoViewPort();
        }, 300);
      },

      handleRestoreTopoToOrigin() {
        this.inputId = '';
        this.currentNode.fx = null;
        this.currentNode.fy = null;
        this.$store.commit('rocketTopo/SET_NODE', {});

        this.$store.commit('rocketTopo/SET_IS_GLOBAL_MODE', false);
        if (this.hasSearchedGlobally) {
          this.$store.commit('rocketTopo/SET_HAS_SEARCHED_GLOBALLY', false);
          // 重置topoViewData
          let topoViewData = this.topoData;
          this.$emit('changeTopoViewData', topoViewData);
        }
        // 隐藏问题：双击还原怎么保证视图布局好之后再重置过滤器
        this.$store.commit('rocketTopo/SET_SHOW_NODE_TYPE_FILTER', 'All');
        this.restoreFilters();

        this.restoreTopoViewPort();
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

    .search-wrapper,
    .size-controller,
    .more-tool-btn,
    .global-search-ctrl {
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
      margin-right: -5px;

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

    .global-search-ctrl {
      label {
        color: #ccc;
        font-weight: normal;
        font-size: 12px;
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
