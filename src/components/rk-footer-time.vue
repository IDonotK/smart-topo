<template>
  <div>
    <span class="rk-time-tips" v-show="timeRange">{{ $t('timeTips') }}</span>
    <RkDate class="mr-10" v-model="time" position="top" format="YYYY-MM-DD HH:mm:ss" />
  </div>
</template>

<script lang="ts">
  import timeFormat from '@/utils/timeFormat';

  export default {
    data() {
      return {
        timeRange: 0,
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
          (this as any).timeRange = val[1].getTime() - val[0].getTime() > 5 * 60 * 1000 ? 1 : 0;
          if ((this as any).timeRange) {
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
