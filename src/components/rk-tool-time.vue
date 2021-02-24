<template>
  <div class="tool-time-wrapper">
    <div class="quick-pick-wrapper">
      <a class="rk-btn mr-5 sm qpw-item" @click="quickPick('oneMinute')">
        <span class="vm">{{ oneMinuteCutTip }}</span>
      </a>
      <a class="rk-btn mr-5 sm qpw-item" @click="quickPick('fiveMinutes')">
        <span class="vm">{{ fiveMinutesCutTip }}</span>
      </a>
      <a class="rk-btn mr-5 sm qpw-item" @click="quickPick('tenMinutes')">
        <span class="vm">{{ tenMinutesCutTip }}</span>
      </a>
    </div>
    <RkDate ref="rkdate" v-model="time" position="bottom" format="YYYY-MM-DD HH:mm:ss" :showButtons="true" />
  </div>
</template>

<script lang="ts">
import timeFormat from '@/utils/timeFormat';

export default {
  data() {
    return {
      oneMinuteCutTip: this.$t('oneMinuteCutTip'),
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
        (this as any).$store.dispatch('SET_DURATION', timeFormat(val));
      },
    },
  },
  methods: {
    quickPick(type) {
      this.$refs.rkdate.quickPick(type);
    },
  },
};
</script>

<style lang="scss" scoped>
.tool-time-wrapper {
    display: flex;

    .rk-btn.qpw-item {
        background-color: darkslategrey;
    }
}
</style>
