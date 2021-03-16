<template>
  <div class="rk-topo">
    <TopoView :topoViewData="topoViewData" :isMatch="isMatch" @restoreFilters="restoreFilters" />
    <TopoSideNavigation :topoViewData="topoViewData" />
    <TopoSideInformation :topoViewData="topoViewData" />
    <TopoToolSet
      ref="topotoolset"
      :topoViewData="topoViewData"
      @onSearchResult="onSearchResult"
      @changeTopoViewData="changeTopoViewData"
    />
  </div>
</template>
<script lang="js">
import { Vue, Component } from 'vue-property-decorator';
import { State, Action, Getter, Mutation } from 'vuex-class';
import { State as topoState } from '@/store/modules/topology';
import { cancelToken } from '@/utils/cancelToken';
import { dateFormat } from '@/utils/topo';

import '../components/topology/utils/icons';
import TopoView from '../components/topology/topo-view.vue';
import TopoSideNavigation from '../components/topology/topo-side-navigation.vue';
import TopoSideInformation from '../components/topology/topo-side-information.vue';
import TopoToolSet from '../components/topology/topo-tool-set.vue';

export default {

  components: {
    TopoView,
    TopoSideNavigation,
    TopoSideInformation,
    TopoToolSet,
  },
  data() {
    return {
      topoViewData: { // 展示的拓扑数据
        nodes: [],
        links: []
      },
      isMatch: true,
    }
  },

  computed: {
    topoData() { // 全部拓扑数据
      return this.$store.state.rocketTopo.topoData;
    },
  },

  watch: {
    topoData(newVal) {
      this.topoViewData = newVal;
    },
  },

  created() {
    this.initSceneConfig();
  },

  methods: {
    initSceneConfig() {
      return this.$store.dispatch('rocketTopo/GET_SCENE_CONFIG', {});
    },
    restoreFilters() {
      this.$refs.topotoolset.restoreFilters();
    },
    changeTopoViewData(newTopoViewData) {
     this.topoViewData = newTopoViewData;
    },
    onSearchResult(isMatch) {
      this.isMatch = isMatch;
    },
  },

}
</script>
<style lang="scss">
.rk-topo {
    position: absolute;
    top: 48px;
    bottom: 0;
    left: 0;
    right: 0;
    min-height: 320px;
    min-width: 1200px;
    background: #333840;
    overflow: hidden;
}
</style>
