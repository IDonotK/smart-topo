<template>
  <div class="rk-topo">
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
        topoData: {},
        topoDataFiltered: {}
      }
    },

    components: {
      TopoView,
      TopoSideNavigation,
      TopoToolSet,
    },

    computed: {
      filterNodeType() {
        return this.$store.state.rocketTopo.filterNodeType;
      }
    },

    watch: {
      filterNodeType(newVal, oldVal) {
        this.filterTopoOnType(newVal);
      }
    },

    created() {
      this.initTopoData();
    },

    methods: {
      initTopoData() {
        this.topoData = {
          nodes: NODES,
          links: LINKS
        };
        this.filterTopoOnType('All');
      },
      filterTopoOnType(nodeType) {
        if (nodeType === 'All') {
          this.topoDataFiltered = this.topoData;
          return;
        }
        let nodesTmp = NODES.filter((node) => node.type === nodeType);
        let linksTmp = LINKS.filter((link) => {
          return (
            nodesTmp &&
            nodesTmp.some((node) => node.id === link.sid) &&
            nodesTmp.some((node) => node.id === link.tid)
          );
        });
        this.topoDataFiltered = { // 整体重新赋值
          nodes: nodesTmp,
          links: linksTmp,
        };
      }
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
