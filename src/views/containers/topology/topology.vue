<template>
  <div class="rk-topo">
    <TopoView :topoData="topoData" :isMatch="isMatch" @restoreFilters="restoreFilters" />
    <TopoSideNavigation :topoData="topoData" />
    <TopoToolSet ref="topotoolset" :topoData="topoData" @onSearchResult="onSearchResult" />
  </div>
</template>
<script lang="js">
  import { Vue, Component } from 'vue-property-decorator';
  import { State, Action, Getter, Mutation } from 'vuex-class';
  import { AxiosResponse } from 'axios';
  import { State as topoState } from '@/store/modules/topology';
  import axios from 'axios';
  import { cancelToken } from '@/utils/cancelToken';
  import { dateFormat } from '@/utils/topo';

  import TopoView from '../../components/topology/topo-view.vue';
  import TopoSideNavigation from '../../components/topology/topo-side-navigation.vue';
  import TopoToolSet from '../../components/topology/topo-tool-set.vue';

  export default {
    data() {
      return {
        isMatch: true,
      }
    },

    components: {
      TopoView,
      TopoSideNavigation,
      TopoToolSet,
    },

    computed: {
      topoData() { // 全部拓扑数据
        return this.$store.state.rocketTopo.topoData;
      },
      durationRow() {
        return this.$store.state.rocketbot.durationRow;
      },
    },

    watch: {
      topoData(newVal) {
        this.$store.commit('rocketTopo/SET_IS_TOPO_NODES_UPDATED', true);
        this.$store.commit('rocketTopo/SET_IS_TOPO_LINKS_UPDATED', true);
        if (newVal.nodes.length <= 2) {
          this.$store.commit('rocketTopo/SET_TOPO_SCALE_FIX', 2);
        } else {
          this.$store.commit('rocketTopo/SET_TOPO_SCALE_FIX', 1);
        }
        this.$store.commit('rocketTopo/SET_IS_FIRST_TICK', true);
      },
    },

    created() {
      this.initTopoData();
    },

    methods: {
      restoreFilters() {
        this.$refs.topotoolset.restoreFilters();
      },
      onSearchResult(isMatch) {
        this.isMatch = isMatch;
      },
      initTopoData() {
        this.$store.dispatch('rocketTopo/GET_TOPO_DATA', {
          start_time: dateFormat("YYYY-mm-dd HH:MM:SS", this.durationRow.start),
          end_time: dateFormat("YYYY-mm-dd HH:MM:SS", this.durationRow.end),
        });
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
