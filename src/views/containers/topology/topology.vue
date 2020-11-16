<template>
  <div class="rk-topo">
    <!-- gittest -->
    <TopoView :topoDataFiltered="topoDataFiltered" :topoData="topoData" />
    <TopoSideNavigation :topoData="topoData" />
    <TopoToolSet :topoDataFiltered="topoDataFiltered" />
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
        topoData: {
          nodes: [],
          links: []
        },
        topoDataFiltered: {
          nodes: [],
          links: []
        }
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
    },

    watch: {
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
    },

    created() {
      this.initTopoData();
    },

    methods: {
      initTopoData() {
        setTimeout(() => {
          // query
          this.topoData = {
            nodes: NODES,
            links: LINKS
          };
          this.topoDataFiltered = this.topoData; // 浅拷贝
        }, 2000);
      },
      filterTopo() { // 注意过滤时不应改变原数组元素对象的引用，使用浅拷贝
        // let topoDataFilteredTmp = JSON.parse(JSON.stringify(this.topoData));
        let topoDataFilteredTmp = this.topoData;
        if (this.showNodeTypeFilter === 'All') {
          topoDataFilteredTmp = this.filterTopoOnHideNodeType(this.hideNodeTypeFilter, topoDataFilteredTmp);
        }
        topoDataFilteredTmp = this.filterTopoOnShowNodeType(this.showNodeTypeFilter, topoDataFilteredTmp);
        topoDataFilteredTmp = this.filterTopoOnNodeStateType(this.nodeStateTypeFilter, topoDataFilteredTmp);
        topoDataFilteredTmp = this.filterTopoOnShowEdgeType(this.showEdgeTypeFilter, topoDataFilteredTmp);
        this.topoDataFiltered = topoDataFilteredTmp;
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
