<template>
  <div class="topo-time">
    <!-- 时间选择 -->
    <div class="time-picker">
      <RkDate ref="rkdate" v-model="dateTimes" position="bottom" format="YYYY-MM-DD HH:mm:ss" :showButtons="true" />
    </div>
    <!-- 时间滑轴 -->
    <div class="time-line-wrapper">
      <TopoTimeLine :timeRange="dateTimes" :step="1" labels />
    </div>
  </div>
</template>

<script lang="js">
import { dateFormat } from '@/utils/topo';
import TopoTimeLine from './topo-time-line.vue';

export default {

  components: {
    TopoTimeLine,
  },
  data() {
    return {
      dateTimes: [],
      isClearTopoData: true,
      isExploreMode: false,
    }
  },

  computed: {
    durationRow() {
      return this.$store.state.rocketbot.durationRow;
    },
    toolSetInstance() {
      return this.$store.state.rocketTopo.toolSetInstance;
    },
    networkInstanceMainTopo() {
      return this.$store.state.rocketTopo.networkInstanceMainTopo;
    },
    topoMode() {
      return this.$store.state.rocketTopo.topoMode;
    },
  },

  watch: {
    durationRow(newVal) {
      if (this.isExploreMode) {
        this.loadExploredTopoData();
      } else {
        this.loadTopoData();
      }
    }
  },

  mounted() {
    this.$store.commit('rocketTopo/SET_TOPO_TIME_INSTANCE', this);
    let endTime;
    let startTime;
    let exploreType = this.$route.query.exploreType;
    if (exploreType === 'specific-deep' || exploreType === 'specific-layered') {
      this.$store.commit('rocketTopo/SET_TOPO_MODE', exploreType);
      this.isExploreMode = true;
      let params = JSON.parse(localStorage.getItem('exploreParams'));
      startTime = new Date(params.start_time);
      endTime = new Date(params.end_time);
    } else {
      endTime = new Date();
      startTime = new Date(endTime.getTime() -  10 * 60 * 1000);
    }
    this.setDateTimes(startTime, endTime);
  },

  methods: {
    setDateTimes(startTime, endTime) {
      this.dateTimes = [startTime, endTime];
    },
    filterDataOnTypes(types, data) {
      let nodeIds = [];
      data.nodes = data.nodes.filter(node => {
        if (types.includes(node.type)) {
          nodeIds.push(node.id);
          return true;
        } else {
          return false;
        }
      });
      data.links = data.links.filter(link => nodeIds.includes(link.sid) && nodeIds.includes(link.tid));
    },
    loadExploredTopoData() {
      let isClearTopoData = this.isClearTopoData;
      this.isClearTopoData = false;
      if (isClearTopoData) {
        this.$store.commit('rocketTopo/SET_IS_LOADING_TOPO', true);
        this.$store.commit('rocketTopo/SET_TOPO_DATA', {
          nodes: [],
          links: [],
        });
      } else {
        this.$store.commit('rocketTopo/SET_IS_LOADING_TOPO', false);
      }
      let params = JSON.parse(localStorage.getItem('exploreParams'));
      this.toolSetInstance.exploreRelativeElems({}, (upstreamData, downstreamData, exploreNode) => {
        if (this.topoMode === 'specific-layered') {
          this.filterDataOnTypes(['Application','MiddleWare'], upstreamData);
          this.filterDataOnTypes(['Application','MiddleWare'], downstreamData);
          this.$store.commit('rocketTopo/SET_LAYERED_EXPLORE_NODE', exploreNode);
        }
        let relativeData = {
          nodes: [exploreNode,
            ...upstreamData.nodes.filter(node => node.id !== exploreNode.id),
            ...downstreamData.nodes.filter(node => node.id !== exploreNode.id)
          ],
          links: [...upstreamData.links, ...downstreamData.links],
        };
        this.$store.commit('rocketTopo/SET_IS_LOADING_TOPO', false);
        this.$store.commit('rocketTopo/SET_TOPO_DATA', {
          nodes: relativeData.nodes,
          links: relativeData.links,
        });
        this.toolSetInstance.handleAfterExplore(upstreamData, downstreamData, relativeData, exploreNode);
        this.isExploreMode = false;
        this.$router.push('/topology');
      }, params);
    },
    loadTopoData() {
      if (this.networkInstanceMainTopo.topoScaleFix > -1) {
        this.toolSetInstance.refreshTopoView();
      }
      let isClearTopoData = this.isClearTopoData;
      this.isClearTopoData = false;
      this.$store.dispatch('rocketTopo/GET_TOPO_DATA', {
        start_time: dateFormat('YYYY-mm-dd HH:MM:SS', this.durationRow.start),
        end_time: dateFormat('YYYY-mm-dd HH:MM:SS', this.durationRow.end),
        isClearTopoData
      });
    }
  }
}
</script>

<style lang="scss">
.topo-time {
    width: 100%;
    padding: 5px 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    .time-picker {
        width: auto;
        background: #242424;
        border-radius: 3px;

        .el-input__inner {
            width: 320px !important;
            padding: 3px !important;

            & > input {
                background: #252a2f;
            }

            &:hover {
                border-color: rgba(204, 204, 204, 0.2) !important;
            }
        }

        .el-range-editor.is-active {
            border-color: rgba(204, 204, 204, 0.2) !important;
        }
    }

    .time-line-wrapper {
        flex-grow: 1;
    }
}
</style>
