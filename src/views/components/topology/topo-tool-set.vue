<template>
  <div class="topo-tool-set">
    <!-- 拓扑探索 -->
    <div class="explore-topo-wrapper">
      <svg class="icon topo-icon" @click="handleClickExploreBtn">
        <use xlink:href="#explore"></use>
        <title>探索拓扑</title>
      </svg>
      <el-dialog class="explore-dialog" title="探索拓扑" :visible.sync="isShowExplore" width="30%">
        <div class="modes-wrapper">
          <div class="mw-item">
            <el-radio v-model="exploreMode" label="specific">目标节点</el-radio>
            <el-input v-model="specificId" placeholder="请输入节点ID" :disabled="exploreMode === 'global'"></el-input>
          </div>
          <div class="mw-item">
            <el-radio v-model="exploreMode" label="global">全部节点</el-radio>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="isShowExplore = false">取 消</el-button>
          <el-button type="primary" @click="handleConfirmExplore">确 定</el-button>
        </span>
      </el-dialog>
    </div>
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
        <title>放大拓扑</title>
      </svg>
      <svg class="topo-icon smaller" aria-hidden="true" @click="handleNarrowTopo">
        <use xlink:href="#icon-fangdajingsuoxiao"></use>
        <title>缩小拓扑</title>
      </svg>
      <svg
        class="topo-icon restore"
        aria-hidden="true"
        @click.stop.prevent="handleRestoreTopo"
        @dblclick.stop.prevent="handleRestoreTopoToOrigin"
      >
        <use xlink:href="#icon-huanyuan"></use>
        <title>还原拓扑</title>
      </svg>
    </div>
    <!-- 更多按钮 -->
    <!-- <div class="more-tool-btn">
      <svg class="topo-icon more" aria-hidden="true" @click="handleToggleMoreTool">
        <use xlink:href="#icon-gengduo"></use>
      </svg>
    </div> -->
    <!-- 工具集合 -->
    <!-- <div class="more-tool-wrapper" v-show="moreToolState"></div> -->
    <!-- 工具栏 -->
    <div class="tool-bar">
      <div class="tb-item node-types-filter">
        <div
          class="ntf-item"
          v-for="(item, index) in nodeTypesOption.data"
          :key="index"
          :class="{ unchecked: !item.checked }"
        >
          <span class="item-title">{{ item.label }}</span>
          <span
            class="item-btn"
            :style="'background-color:' + pallet[item.label]"
            @click="toggleNodeTypeChecked(item)"
          ></span>
        </div>
      </div>
      <div class="tb-item state-types-filter">
        <div
          class="stf-item"
          v-for="(item, index) in stateTypesOption.data"
          :key="index"
          :class="{ unchecked: !item.checked }"
        >
          <span class="item-title">{{ item.label }}</span>
          <span
            class="item-btn"
            :style="'background-color:' + pallet['State']"
            @click="toggleStateTypeChecked(item)"
          ></span>
        </div>
      </div>
      <div class="tb-item relative-types-filter" v-show="currentNode.id !== undefined">
        <div
          class="rtf-item"
          v-for="(item, index) in relativeTypesOption.data"
          :key="index"
          :class="{ unchecked: !item.checked }"
        >
          <span class="item-title">{{ item.label }}</span>
          <span
            class="item-btn"
            :style="'background-color:' + pallet['Relative']"
            @click="toggleRelativeTypeChecked(item)"
          ></span>
        </div>
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
        isShowExplore: false,
        exploreMode: 'specific',
        specificId: '',
        inputId: '',
        moreToolState: false,
        pallet: {
          App: '#3fb1e3',
          Middleware: '#a0a7e6',
          Process: '#96dee8',
          Workload: '#3f96e3',
          Pod: '#6be6c1',
          Node: '#6be6c1',
          State: '#626c91',
          Relative: '#a0a7e6',
          other2: '#c4ebad',
          other1: '#96dee8',
        },
        nodeTypesOption: {
          title: '显示节点类型',
          data: [
            {key: 0, label: 'App', checked: true},
            {key: 1, label: 'Middleware', checked: true},
            {key: 2, label: 'Process', checked: true},
            {key: 3, label: 'Workload', checked: true},
            {key: 4, label: 'Pod', checked: true},
            {key: 5, label: 'Node', checked: true},
          ],
        },
        stateTypesOption: {
          title: '节点状态类型',
          data: [
            {key: 0, label: 'Normal', checked: true},
            {key: 1, label: 'Abnormal', checked: true},
          ],
        },
        relativeTypesOption: {
          title: '关联节点类型',
          data: [
            {key: 0, label: '上游节点', checked: true},
            {key: 1, label: '下游节点', checked: true},
          ],
        },
        nodeSingleClickTimer: null,
        elemIdsRTCAll: {
          nodeIds: [],
          linkIds: []
        },
        elemIdsRTCUp: {
          nodeIds: [],
          linkIds: []
        },
        elemIdsRTCDown: {
          nodeIds: [],
          linkIds: []
        },
        elemsRTCAll: {
          nodes: [],
          links: []
        },
        elemsRTCUp: {
          nodes: [],
          links: []
        },
        elemsRTCDown: {
          nodes: [],
          links: []
        },
      }
    },

    mounted() {
      let nodeTypes = this.nodeTypesOption.data.filter(type => type.checked).map(type => type.label);
      let stateTypes = this.stateTypesOption.data.filter(type => type.checked).map(type => type.label);
      let relativeTypes = this.relativeTypesOption.data.filter(type => type.checked).map(type => type.label);
      this.$store.commit('rocketTopo/SET_SHOW_NODE_TYPES', nodeTypes);
      this.$store.commit('rocketTopo/SET_SHOW_STATE_TYPES', stateTypes);
      this.$store.commit('rocketTopo/SET_SHOW_RELATIVE_TYPES', relativeTypes);
    },

    components: {
      TopoSelect
    },

    computed: {
      topoMode() {
        return this.$store.state.rocketTopo.topoMode;
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
    },

    watch: {
      inputId(newVal) {
        if (newVal === '') {
          this.$emit('onSearchResult', true);
        }
      },
      currentNode(newVal) {
        if (newVal.id !== undefined) {
          // 注意:这里是基于视图数据topoViewData进行查询上下游节点
          this.getRelativeElems(this.currentNode, this.topoViewData, this.filterTopo);
        } else {
          this.elemIdsRTCUp = {
            nodeIds: [],
            linkIds: []
          };
          this.elemIdsRTCDown = {
            nodeIds: [],
            linkIds: []
          };
          this.elemIdsRTCAll = {
            nodeIds: [],
            linkIds: []
          };

          this.elemsRTCUp = {
            nodes: [],
            links: []
          };
          this.elemsRTCDown = {
            nodes: [],
            links: []
          };
          this.elemsRTCAll = {
            nodes: [],
            links: []
          };
          this.filterTopo();
        }
      },
    },

    methods: {
      getRelativeElems(curNode, topoData, cb) {
        // query上下游节点,数据模拟:单跳数据
        let elemIdsRTCUpTmp = {
          nodeIds: [],
          linkIds: []
        };
        let elemIdsRTCDownTmp = {
          nodeIds: [],
          linkIds: []
        };

        let elemsRTCUpTmp = {
          nodes: [],
          links: []
        };
        let elemsRTCDownTmp = {
          nodes: [],
          links: []
        };
        topoData.links.forEach((link) => {
          if (link.sid === curNode.id) { // 模拟下游节点
            elemIdsRTCDownTmp.nodeIds.push(link.target.id);
            elemIdsRTCDownTmp.linkIds.push(link.id);

            elemsRTCDownTmp.nodes.push(link.target);
            elemsRTCDownTmp.links.push(link);
          } else if (link.tid === curNode.id) { // 模拟上游节点
            elemIdsRTCUpTmp.nodeIds.push(link.source.id);
            elemIdsRTCUpTmp.linkIds.push(link.id);

            elemsRTCUpTmp.nodes.push(link.source);
            elemsRTCUpTmp.links.push(link);
          }
        });
        this.elemIdsRTCUp = elemIdsRTCUpTmp;
        this.elemIdsRTCDown = elemIdsRTCDownTmp;
        this.elemIdsRTCAll = {
          nodeIds: [...elemIdsRTCUpTmp.nodeIds, ...elemIdsRTCDownTmp.nodeIds],
          linkIds: [...elemIdsRTCUpTmp.linkIds, ...elemIdsRTCDownTmp.linkIds]
        };

        this.elemsRTCUp = elemsRTCUpTmp;
        this.elemsRTCDown = elemsRTCDownTmp;
        this.elemsRTCAll = {
          nodes: [curNode, ...elemsRTCUpTmp.nodes, ...elemsRTCDownTmp.nodes],
          links: [...elemsRTCUpTmp.links, ...elemsRTCDownTmp.links]
        };
        // 获取到数据后执行回调函数
        if (cb) {
          cb();
        }
      },

      // 探索
      handleConfirmExplore(done) {
        if (this.exploreMode === 'specific') {
          if (this.specificId === '') {
            return;
          }

          // 查询目标节点
          let result = {};
          result = this.topoData.nodes.find(node => String(node.id) === this.specificId);
          if (result === undefined) {
            return;
          }
          this.isShowExplore = false;
          this.$store.commit('rocketTopo/SET_TOPO_MODE', this.exploreMode);
          this.getRelativeElems(result, this.topoData, () => { // 注意:这里是基于全局数据topoData进行查询上下游节点
            // 查询目标节点的上下游topo,替换topoViewData
            this.$store.commit('rocketTopo/SET_VIEW_NODE', {});
            this.$store.commit('rocketTopo/SET_NODE', {});
            this.$emit('changeTopoViewData', this.elemsRTCAll);

            // 待拓扑布局稳定后,手动选中目标节点
            this.$store.commit('rocketTopo/SET_VIEW_NODE', result);
            this.$store.commit('rocketTopo/SET_EXPLORE_NODE', result);
            this.setCurNodeStably(result);
          });
        } else if (this.exploreMode === 'global') {
          this.isShowExplore = false;
          this.restoreTopoViewPort(0);
          this.$store.commit('rocketTopo/SET_TOPO_MODE', this.exploreMode);
          this.$emit('changeTopoViewData', this.topoData);
          this.$store.commit('rocketTopo/SET_VIEW_NODE', {});
          this.$store.commit('rocketTopo/SET_NODE', {});
        }
      },
      handleClickExploreBtn() {
        this.exploreMode = 'specific';
        this.specificId = '';
        this.isShowExplore = true;
      },

      // 过滤
      filterTopo() {
        let nodeTypes = this.nodeTypesOption.data.filter(type => type.checked).map(type => type.label);
        let stateTypes = this.stateTypesOption.data.filter(type => type.checked).map(type => type.label);
        let relativeTypes = this.relativeTypesOption.data.filter(type => type.checked).map(type => type.label);
        let nodeTypesSet = new Set();
        let stateTypesSet = new Set();
        let relativeTypesSet = new Set();
        let elemIdsRTC = { // 暂存关联元素id
          nodeIds: [],
          linkIds: []
        };
        let targetNodeIds = [];

        if (this.currentNode.id !== undefined) { // 已选中节点过滤
          if (relativeTypes.includes('上游节点')) {
            elemIdsRTC.nodeIds.push.apply(elemIdsRTC.nodeIds, this.elemIdsRTCUp.nodeIds);
            elemIdsRTC.linkIds.push.apply(elemIdsRTC.linkIds, this.elemIdsRTCUp.linkIds);
            if (this.elemIdsRTCUp.nodeIds.length > 0) {
              relativeTypesSet.add('上游节点');
            }
          }
          if (relativeTypes.includes('下游节点')) {
            elemIdsRTC.nodeIds.push.apply(elemIdsRTC.nodeIds, this.elemIdsRTCDown.nodeIds);
            elemIdsRTC.linkIds.push.apply(elemIdsRTC.linkIds, this.elemIdsRTCDown.linkIds);
            if (this.elemIdsRTCDown.nodeIds.length > 0) {
              relativeTypesSet.add('下游节点');
            }
          }
          this.topoViewData.nodes.forEach(node => {
            if ((nodeTypes.includes(node.type) && stateTypes.includes(node.state) && elemIdsRTC.nodeIds.includes(node.id))
              || node.id === this.currentNode.id) {
              targetNodeIds.push(node.id);
              node.isDark = false;
              node.showLabel = true;
              node.isRelatedToCurNode = true;
              nodeTypesSet.add(node.type);
              stateTypesSet.add(node.state);
            } else {
              node.isDark = true;
              node.showLabel = false;
              node.isRelatedToCurNode = false;
            }
          });
          this.topoViewData.links.forEach(link => {
            if (targetNodeIds.includes(link.sid) && targetNodeIds.includes(link.tid) && elemIdsRTC.linkIds.includes(link.id)) {
              link.isDark = false;
            } else {
              link.isDark = true;
            }
          });
        } else { // 未选中节点过滤
          this.topoViewData.nodes.forEach(node => {
            if (node.showLabel) { // 选中样式还原
              node.showLabel = false;
            }
            if (node.isRelatedToCurNode) {
              node.isRelatedToCurNode = false;
            }
            if (nodeTypes.includes(node.type) && stateTypes.includes(node.state)) {
              targetNodeIds.push(node.id);
              node.isDark = false;
              nodeTypesSet.add(node.type);
              stateTypesSet.add(node.state);
            } else {
              node.isDark = true;
            }
          });
          this.topoViewData.links.forEach(link => {
            if (targetNodeIds.includes(link.sid) && targetNodeIds.includes(link.tid)) {
              link.isDark = false;
            } else {
              link.isDark = true;
            }
          });
        }

        this.$store.commit('rocketTopo/SET_SHOW_NODE_TYPES', [...nodeTypesSet]);
        this.$store.commit('rocketTopo/SET_SHOW_STATE_TYPES', [...stateTypesSet]);
        this.$store.commit('rocketTopo/SET_SHOW_RELATIVE_TYPES', [...relativeTypesSet]);
      },
      toggleStateTypeChecked(stateType) {
        stateType.checked = !stateType.checked;
        this.filterTopo();
      },
      toggleNodeTypeChecked(nodeType) {
        nodeType.checked = !nodeType.checked;
        this.filterTopo();
      },
      toggleRelativeTypeChecked(relativeType) {
        relativeType.checked = !relativeType.checked;
        this.filterTopo();
      },

      // 搜索
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
      handleMouseUp() {
        this.handleSearchOnId();
      },
      handleSearchOnId() {
        if (this.inputId === '') {
          return;
        }
        let result = {};
        result = this.topoViewData.nodes.find(node => String(node.id) === this.inputId);
        if (result === undefined) {
          this.$emit('onSearchResult', false);
        } else {
          this.$emit('onSearchResult', true);
          this.$store.commit('rocketTopo/SET_VIEW_NODE', result);
          this.setCurNodeStably(result);
          // this.$store.commit('rocketTopo/SET_NODE', result);
        }
      },
      handleClearInputId() {
        this.inputId = '';
        this.$emit('onSearchResult', true);
      },

      // 控制
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
        this.nodeTypesOption.data.forEach(item => {
          item.checked = true;
        });
        this.stateTypesOption.data.forEach(item => {
          item.checked = true;
        });
        this.relativeTypesOption.data.forEach(item => {
          item.checked = true;
        });
      },
      restoreTopoViewPort(duration) {
        let centerX = $jq('#netSvg').width() / 2;
        let centerY = $jq('#netSvg').height() / 2;
        let zoomK = d3.zoomTransform(d3.select('#zoomContainer').node()).k;
        if (zoomK > this.topoScaleFix) {
          this.zoomController.scaleTo(
            d3
              .select('.net-svg')
              .transition()
              .duration(duration),
            this.topoScaleFix,
          );
          setTimeout(() => {
            this.zoomController.translateTo(
              d3
                .select('.net-svg')
                .transition()
                .duration(duration),
              centerX,
              centerY,
            );
          }, duration);
        } else if (zoomK === this.topoScaleFix) {
          this.zoomController.translateTo(
            d3
              .select('.net-svg')
              .transition()
              .duration(duration),
            centerX,
            centerY,
          );
        } else {
          this.zoomController.translateTo(
            d3
              .select('.net-svg')
              .transition()
              .duration(duration),
            centerX,
            centerY,
          );
          setTimeout(() => {
            this.zoomController.scaleTo(
              d3
                .select('.net-svg')
                .transition()
                .duration(duration),
              this.topoScaleFix,
            );
          }, duration);
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
          this.$emit('onSearchResult', true);
          this.currentNode.fx = null;
          this.currentNode.fy = null;
          this.$store.commit('rocketTopo/SET_NODE', {});
          this.$store.commit('rocketTopo/SET_VIEW_NODE', {});
          this.restoreTopoViewPort(500);
        }, 300);
      },
      handleRestoreTopoToOrigin() {
        this.inputId = '';
        this.$emit('onSearchResult', true);
        this.currentNode.fx = null;
        this.currentNode.fy = null;
        this.$store.commit('rocketTopo/SET_NODE', {});
        this.$store.commit('rocketTopo/SET_VIEW_NODE', {});
        this.restoreFilters();
        this.restoreTopoViewPort(500);
      },

      // 更多
      handleToggleMoreTool() {
        this.moreToolState = !this.moreToolState;
      },
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

    .explore-topo-wrapper,
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

    .explore-topo-wrapper {
      .explore-dialog {
        .el-dialog {
          background-color: #333840;

          .el-dialog__header .el-dialog__title {
            color: #ccc;
          }

          .el-dialog__body {
            .modes-wrapper {
              .mw-item {
                display: flex;
                align-items: center;
                justify-content: flex-start;

                .el-radio {
                  color: #ccc;
                  margin-right: 10px;
                }

                .el-input {
                  &.is-disabled {
                    opacity: 0.5;
                  }
                }

                .el-input__inner {
                  background-color: #ddd;

                  &::-webkit-input-placeholder {
                    color: #252a2f;
                    opacity: 0.5;
                  }
                }
              }
            }
          }

          .el-dialog__footer .dialog-footer {
            .el-button {
              border: none;
            }

            .el-button--default {
              background-color: #ccc;
            }

            .el-button--primary {
              color: #ccc;
            }
          }
        }
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

    .tool-bar {
      position: absolute;
      top: 100%;
      right: 0;
      padding: 8px 10px;
      margin-top: 8px;
      background-color: transparent;

      .tb-item {
        width: 100%;
        position: relative;
        z-index: 2000;
        margin-bottom: 20px;

        .ntf-item,
        .stf-item,
        .rtf-item {
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: flex-end;

          &.unchecked {
            opacity: 0.2;
          }

          .item-title {
            color: #ddd;
            margin-right: 10px;
          }

          .item-btn {
            display: inline-block;
            width: 30px;
            height: 20px;
            border-radius: 5px;
            cursor: pointer;
          }
        }
      }
    }
  }
</style>
