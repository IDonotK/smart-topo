<template>
  <div>
    <span v-show="timeRangeMax" class="rk-time-tips">{{ $t('timeMaxTips') }}</span>
    <span v-show="timeRangeMin" class="rk-time-tips">{{ $t('timeMinTips') }}</span>
    <RkDate v-model="time" class="mr-10" position="top" format="YYYY-MM-DD HH:mm:ss" />
  </div>
</template>

<script lang="ts">
import timeFormat from '@/utils/timeFormat';

export default {
  data() {
    return {
      timeRangeMax: 0,
      timeRangeMin: 0,
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

<style scoped>
.rk-time-tips {
    color: red;
}
</style>
