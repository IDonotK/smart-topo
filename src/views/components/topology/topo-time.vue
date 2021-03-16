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
  },

  watch: {
    durationRow(newVal) {
      this.loadTopoData();
    }
  },

  mounted() {
    this.$store.commit('rocketTopo/SET_TOPO_TIME_INSTANCE', this);
    let endTime = new Date();
    let startTime = new Date(endTime.getTime() -  10 * 60 * 1000);
    this.setDateTimes(startTime, endTime);
  },

  methods: {
    setDateTimes(startTime, endTime) {
      this.dateTimes = [startTime, endTime];
    },
    loadTopoData() {
      if (this.networkInstanceMainTopo.topoScaleFix > -1) { // ?
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
