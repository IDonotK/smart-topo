<template>
  <div class="rk-topo">
    <TopoView :topoData="topoData" :topoViewData="topoViewData" :isMatch="isMatch" @restoreFilters="restoreFilters" />
    <TopoSideNavigation :topoViewData="topoViewData" />
    <TopoToolSet
      ref="topotoolset"
      :topoData="topoData"
      :topoViewData="topoViewData"
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
  import axios from 'axios';
  import { cancelToken } from '@/utils/cancelToken';

  import TopoView from '../../components/topology/topo-view.vue';
  import TopoSideNavigation from '../../components/topology/topo-side-navigation.vue';
  import TopoToolSet from '../../components/topology/topo-tool-set.vue';

  export default {
    data() {
      return {
        topoViewData: { // 展示的拓扑数据
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
      topoData() { // 全部拓扑数据
        return this.$store.state.rocketTopo.topoData;
      },
      durationRow() {
        return this.$store.state.rocketbot.durationRow;
      },
    },

    watch: {
      topoViewData(newVal) {
        if (newVal.nodes.length === 1) {
          this.$store.commit('rocketTopo/SET_TOPO_SCALE_FIX', 2);
        } else {
          this.$store.commit('rocketTopo/SET_TOPO_SCALE_FIX', -1);
        }
        this.$store.commit('rocketTopo/SET_IS_FIRST_TICK', true);
      },
      topoData(newVal) {
        this.$store.commit('rocketTopo/SET_IS_TOPO_NODES_UPDATED', true);
        this.$store.commit('rocketTopo/SET_IS_TOPO_LINKS_UPDATED', true);
        this.topoViewData = newVal;
      },
    },

    created() {
      this.initTopoData();
    },

    methods: {
      dateFormat(fmt, date) {
        let ret;
        const opt = {
            "Y+": date.getFullYear().toString(),        // 年
            "m+": (date.getMonth() + 1).toString(),     // 月
            "d+": date.getDate().toString(),            // 日
            "H+": date.getHours().toString(),           // 时
            "M+": date.getMinutes().toString(),         // 分
            "S+": date.getSeconds().toString()          // 秒
            // 有其他格式化字符需求可以继续添加，必须转化成字符串
        };
        for (let k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
            };
        };
        return fmt;
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
      initTopoData() {
        this.$store.dispatch('rocketTopo/GET_TOPO_DATA', {
          start_time: this.dateFormat("YYYY-mm-dd HH:MM:SS", this.durationRow.start),
          end_time: this.dateFormat("YYYY-mm-dd HH:MM:SS", this.durationRow.end),
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
