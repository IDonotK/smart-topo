<template>
  <div class="tool-time-wrapper">
    <!-- <span class="rk-time-tips" v-show="timeRangeMax">{{ $t('timeMaxTips') }}</span>
    <span class="rk-time-tips" v-show="timeRangeMin">{{ $t('timeMinTips') }}</span> -->
    <div class="quick-pick-wrapper">
      <a class="rk-btn mr-5 sm qpw-item" @click="quickPick('oneMinute')">
        <span class="vm">{{ this.oneMinuteCutTip }}</span>
      </a>
      <a class="rk-btn mr-5 sm qpw-item" @click="quickPick('fiveMinutes')">
        <span class="vm">{{ this.fiveMinutesCutTip }}</span>
      </a>
      <a class="rk-btn mr-5 sm qpw-item" @click="quickPick('tenMinutes')">
        <span class="vm">{{ this.tenMinutesCutTip }}</span>
      </a>
    </div>
    <RkDate v-model="time" position="top" format="YYYY-MM-DD HH:mm:ss" />
  </div>
</template>

<script lang="ts">
  import timeFormat from '@/utils/timeFormat';

  export default {
    data() {
      return {
        timeRangeMax: 0,
        timeRangeMin: 0,
        oneMinuteCutTip: this.$t('oneMinuteCutTip'),
        threeMinutesCutTip: this.$t('threeMinutesCutTip'),
        fiveMinutesCutTip: this.$t('fiveMinutesCutTip'),
        tenMinutesCutTip: this.$t('tenMinutesCutTip'),
      };
    },
    computed: {
      time: {
        get() {
          return [
            (this as any).$store.state.rocketbot.durationRow.start, // 利用Vuex特性，双向绑定，相应变化
            (this as any).$store.state.rocketbot.durationRow.end,
          ];
        },
        set(val: Date[]) {
          (this as any).timeRangeMax = val[1].getTime() - val[0].getTime() > 10 * 60 * 1000 ? 1 : 0;
          if ((this as any).timeRangeMax) {
            return;
          }
          (this as any).timeRangeMin = val[1].getTime() - val[0].getTime() < 30 * 1000 ? 1 : 0;
          if ((this as any).timeRangeMin) {
            return;
          }
          (this as any).$store.dispatch('SET_DURATION', timeFormat(val));
        },
      },
    },
  };
</script>

<style lang="scss" scoped>
  .rk-time-tips {
    color: red;
  }
  .tool-time-wrapper {
    display: flex;
    .rk-btn.qpw-item {
      background-color: darkslategrey;
    }
  }
</style>
