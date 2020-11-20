<template>
  <div class="rk-topo">
    <TopoView
      :topoData="topoData"
      :topoViewData="topoViewData"
      :isMatch="isMatch"
      @changeTopoViewData="changeTopoViewData"
      @restoreFilters="restoreFilters"
    />
    <TopoSideNavigation :topoData="topoData" />
    <TopoToolSet
      ref="topotoolset"
      :topoData="topoData"
      :topoDataFiltered="topoDataFiltered"
      @onSearchResult="onSearchResult"
      @changeTopoViewData="changeTopoViewData"
    />
  </div>
</template>
<script lang="js">
  import { Vue, Component } from 'vue-property-decorator';
  import { State, Action, Getter, Mutation } from 'vuex-class';
  import { AxiosResponse } from 'axios';
  import { State as topoState } from '@/store/modules/topology';

  import TopoView from '../../components/topology/topo-view.vue';
  import TopoSideNavigation from '../../components/topology/topo-side-navigation.vue';
  import TopoToolSet from '../../components/topology/topo-tool-set.vue';
  import { NODES, LINKS } from './data.js';

  export default {
    data() {
      return {
        topoData: { // 获取的全部数据
          nodes: [],
          links: []
        },
        topoViewData: { // 展示的拓扑数据
          nodes: [],
          links: []
        },
        topoDataFiltered: { // 明暗的拓扑数据
          nodes: [],
          links: []
        },
        elemsAroundPreCurNode: {
          nodes: [],
          links: []
        },
        isMatch: true,
      }
    },

    components: {
      TopoView,
      TopoSideNavigation,
      TopoToolSet,
    },

    computed: {
      showNodeTypeFilter() { // 左侧栏显示点类型过滤
        return this.$store.state.rocketTopo.showNodeTypeFilter;
      },
      hideNodeTypeFilter() { // 右上角隐藏点类型过滤
        return this.$store.state.rocketTopo.hideNodeTypeFilter;
      },
      nodeStateTypeFilter() { // 右上角点状态类型过滤
        return this.$store.state.rocketTopo.nodeStateTypeFilter;
      },
      showEdgeTypeFilter() { // 右上角显示边类型过滤
        return this.$store.state.rocketTopo.showEdgeTypeFilter;
      },
      relativeNodeType() { // 右上角关联点类型过滤
        return this.$store.state.rocketTopo.relativeNodeType;
      },
      currentNode() { // 当前选中节点
        return this.$store.state.rocketTopo.currentNode;
      },
    },

    watch: {
      topoViewData(newVal) {
        if (newVal.length === 1) {
          this.$store.commit('rocketTopo/SET_TOPO_SCALE_FIX', 1);
        } else {
          this.$store.commit('rocketTopo/SET_TOPO_SCALE_FIX', -1);
        }
        this.$store.commit('rocketTopo/SET_IS_FIRST_TICK', true);
      },
      topoData(newVal) {
        this.topoViewData = newVal;
        this.topoDataFiltered = newVal;
      },
      showNodeTypeFilter(newVal, oldVal) { // 性能优化，降低过滤频率
        this.filterTopo();
      },
      hideNodeTypeFilter(newVal, oldVal) {
        this.filterTopo();
      },
      nodeStateTypeFilter(newVal, oldVal) {
        this.filterTopo();
      },
      showEdgeTypeFilter(newVal, oldVal) {
        this.filterTopo();
      },
      relativeNodeType(newVal) {
        this.lightAroundCurrentNode(this.currentNode, newVal);
      },
      currentNode(newVal, oldVal) {
        this.lightAroundCurrentNode(newVal, this.relativeNodeType);
      },
    },

    created() {
      this.initTopoData();
    },

    methods: { // dark：置暗；light：高亮；normal：正常
      restoreFilters() {
        this.$refs.topotoolset.restoreFilters();
      },
      changeTopoViewData(newTopoViewData) {
       this.topoViewData = newTopoViewData;
      },
      onSearchResult(isMatch) {
        this.isMatch = isMatch;
      },
      initTopoData() {
        setTimeout(() => {
          // query
          this.topoData = {
            nodes: NODES,
            links: LINKS
          };
          // 如何局部更新topo？
          this.$store.commit('rocketTopo/SET_IS_TOPO_NODES_UPDATED', true);
          this.$store.commit('rocketTopo/SET_IS_TOPO_LINKS_UPDATED', true);

          // 若把vue-d3-network里的buildNodes、buildLinks的逻辑部分抽出到这里，则会导致多处需要手动强制刷新topo组件视图？

          this.topoViewData = this.topoData;
          this.topoDataFiltered = this.topoData;
        }, 2000);
        // 处理轮询的逻辑
      },
      normalAroundPreCurNode() {
        this.elemsAroundPreCurNode.nodes.forEach(node => {
          node.isBright = false;
          node.showLabel = false;
          node.isRelatedToCurNode = false;
        });
        this.elemsAroundPreCurNode.links.forEach(link => {
          link.isBright = false;
          link.isRelatedToCurNode = false;
        });
      },
      // 关联节点高亮
      lightAroundCurrentNode(curNode, relativeNodeType) {
        this.normalAroundPreCurNode();
        if (curNode.id === undefined) {
          return;
        }
        let elemsAround = {
          nodes: [],
          links: []
        };
        switch (relativeNodeType) {
          case 'Single Hop': elemsAround = this.getAcnSingleHop(curNode); break;
          case 'All Streams': elemsAround = this.getAcnAllStreams(curNode); break;
          case 'Up Stream': elemsAround = this.getAcnUpStream(curNode); break;
          case 'Down Stream': elemsAround = this.getAcnDownStream(curNode); break;
          default: break;
        }
        elemsAround.nodes.forEach(node => {
          node.isBright = true;
          node.showLabel = true;
          node.isRelatedToCurNode = true;
        });
        elemsAround.links.forEach(link => {
          link.isBright = true;
          link.isRelatedToCurNode = true;
        });
        // 注意，这里记录的上一个选中节点被light后的周边元素集合，浅拷贝
        this.elemsAroundPreCurNode = elemsAround;
      },
      getAcnSingleHop(curNode) {
        let elemsAround = {
          nodes: [],
          links: []
        };
        elemsAround.nodes.push(curNode);
        // this.topoDataFiltered.links.forEach((link) => {
        this.topoData.links.forEach((link) => { // 这里需要和mouseEnter保持一致吗？基于全局数据，而非过滤后的数据
          if (link.sid === curNode.id) {
            elemsAround.nodes.push(link.target);
            elemsAround.links.push(link);
          } else if (link.tid === curNode.id) {
            elemsAround.nodes.push(link.source);
            elemsAround.links.push(link);
          }
        });
        return elemsAround;
      },
      getAcnAllStreams(curNode) {
        // query
      },
      getAcnUpStream(curNode) {
        // query
      },
      getAcnDownStream(curNode) {
        // query
      },

      darkTopoAll() {
        this.topoData.nodes.forEach((node) => {
          node.isDark = true;
          node.isBright = false;
          node.showLabel = false;
        });
        this.topoData.links.forEach((link) => {
          link.isDark = true;
          link.isBright = false;
        });
      },
      normalTopoFiltered() { // 遍历耗时
        this.darkTopoAll();
        this.topoDataFiltered.nodes.forEach(node => {
          node.isDark = false;
          node.isBright = false;
          node.showLabel = false;
        });
        this.topoDataFiltered.links.forEach(link => {
          link.isDark = false;
          link.isBright = false;
        });
      },
      filterTopo() {
        let topoDataFilteredTmp = this.topoData; // 注意过滤时不应改变原数组元素对象的引用，使用浅拷贝
        if (this.showNodeTypeFilter === 'All') {
          topoDataFilteredTmp = this.filterTopoOnHideNodeType(this.hideNodeTypeFilter, topoDataFilteredTmp);
        }
        topoDataFilteredTmp = this.filterTopoOnShowNodeType(this.showNodeTypeFilter, topoDataFilteredTmp);
        topoDataFilteredTmp = this.filterTopoOnNodeStateType(this.nodeStateTypeFilter, topoDataFilteredTmp);
        topoDataFilteredTmp = this.filterTopoOnShowEdgeType(this.showEdgeTypeFilter, topoDataFilteredTmp);
        this.topoDataFiltered = topoDataFilteredTmp;
        console.log('topoDataFilteredTmp: ', topoDataFilteredTmp);
        this.normalTopoFiltered();
      },
      filterTopoOnShowNodeType(nodeType, topoDataFiltered) {
        if (nodeType === 'All') {
          return topoDataFiltered;
        }
        let nodesTmp = topoDataFiltered.nodes.filter((node) => node.type === nodeType);
        let linksTmp = topoDataFiltered.links.filter((link) => {
          return (
            nodesTmp.length > 0 &&
            nodesTmp.some((node) => node.id === link.sid) &&
            nodesTmp.some((node) => node.id === link.tid)
          );
        });
        topoDataFiltered = null;
        topoDataFiltered = {
          nodes: nodesTmp,
          links: linksTmp,
        };
        return topoDataFiltered;
      },
      filterTopoOnHideNodeType(nodeType, topoDataFiltered) {
        if (nodeType === 'None') {
          topoDataFiltered = this.topoData;
          return topoDataFiltered;
        }
        let nodesTmp = topoDataFiltered.nodes.filter((node) => node.type !== nodeType);
        let linksTmp = topoDataFiltered.links.filter((link) => {
          return (
            nodesTmp.length > 0 &&
            nodesTmp.some((node) => node.id === link.sid) &&
            nodesTmp.some((node) => node.id === link.tid)
          );
        });
        topoDataFiltered = null;
        topoDataFiltered = {
          nodes: nodesTmp,
          links: linksTmp,
        };
        return topoDataFiltered;
      },
      filterTopoOnNodeStateType(stateType, topoDataFiltered) {
        let nodesTmp = [];
        let linksTmp = [];
        if (stateType === 'All') {
          nodesTmp = topoDataFiltered.nodes;
          linksTmp = topoDataFiltered.links;
        } else {
          nodesTmp = topoDataFiltered.nodes.filter((node) => node.state === stateType);
          linksTmp = topoDataFiltered.links.filter((link) => {
            return (
              nodesTmp.length > 0 &&
              nodesTmp.some((node) => node.id === link.sid) &&
              nodesTmp.some((node) => node.id === link.tid)
            );
          });
        }
        topoDataFiltered = null;
        topoDataFiltered = {
          nodes: nodesTmp,
          links: linksTmp,
        };
        return topoDataFiltered;
      },
      filterTopoOnShowEdgeType(edgeType, topoDataFiltered) {
        let nodesTmp = [];
        let linksTmp = [];
        if (edgeType === 'All') {
          nodesTmp = topoDataFiltered.nodes;
          linksTmp = topoDataFiltered.links;
        } else {
          linksTmp = topoDataFiltered.links.filter((link) => link.type === edgeType.split(' ').join('').toLowerCase());
          nodesTmp = topoDataFiltered.nodes.filter((node) => {
            return (
              linksTmp.length > 0 &&
              (linksTmp.some((link) => link.sid === node.id) ||
              linksTmp.some((link) => link.tid === node.id))
            )
          });
        }
        topoDataFiltered = null;
        topoDataFiltered = {
          nodes: nodesTmp,
          links: linksTmp,
        };
        return topoDataFiltered;
      },
    },

  }
</script>
<style lang="scss">
  .rk-topo {
    position: absolute;
    top: 48px;
    bottom: 30px;
    left: 0;
    right: 0;
    min-height: 320px;
    min-width: 500px;
    background: #333840;
    overflow: hidden;
  }
</style>
