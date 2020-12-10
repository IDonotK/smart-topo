<template>
  <header class="rk-header flex-h">
    <div class="flex-h hcs-header">
      <svg class="icon hcs-logo">
        <use xlink:href="#huawei"></use>
      </svg>
      <span class="grey hcs-title">HCS全息排查</span>
      <router-link class="nav-link mr-20" to="/topology">
        <svg class="icon sm vm">
          <use xlink:href="#issues"></use>
        </svg>
        <span class="vm hide-xs ml-5">{{ this.$t('topology') }}</span>
      </router-link>
    </div>
    <div class="flex-h">
      <a class="rk-btn mr-5 sm" :class="isAutoReloadTopo ? 'blue' : 'ghost'" @click="handleAuto">
        <span class="vm">{{ this.$t('auto') }}</span>
      </a>
      <div class="auto-time">
        <span class="rk-auto-select">
          <input v-model="autoTime" type="number" @change="changeAutoTime" min="10" />
        </span>
        {{ this.$t('second') }}
      </div>
      <a class="rk-btn sm ghost" @click="handleReload" :class="{ 'reload-static': isAutoReloadTopo }">
        <svg class="icon mr-5 vm" :class="{ loading: isAutoReloadTopo }">
          <use xlink:href="#retry"></use>
        </svg>
        <span class="vm">{{ this.$t('reload') }}</span>
      </a>
    </div>
  </header>
</template>

<script lang="ts">
  import { Vue, Component, Watch } from 'vue-property-decorator';
  import { Mutation, Action, State, Getter } from 'vuex-class';
  import timeFormat from '@/utils/timeFormat';
  import { dateFormat } from '@/utils/topo';

  @Component
  export default class Header extends Vue {
    @State('rocketbot') private rocketbot: any;
    @State('rocketTopo') private rocketTopo: any;
    @Getter('duration') private duration: any;
    @Action('SET_DURATION') private SET_DURATION: any;
    @Action('rocketTopo/GET_TOPO_DATA') private GET_TOPO_DATA: any;
    @Mutation('rocketTopo/SET_IS_AUTO_RELOAD_TOPO') private SET_IS_AUTO_RELOAD_TOPO: any;

    private autoTime: number = 10;
    private timer: any = null;

    private get isAutoReloadTopo() {
      return this.rocketTopo.isAutoReloadTopo;
    }
    @Watch('isAutoReloadTopo')
    private changeIsAutoReloadTopo(newVal) {
      if (newVal === false) {
        clearInterval(this.timer);
      }
    }

    private get durationRow() {
      return this.rocketbot.durationRow;
    }
    @Watch('durationRow')
    private onDurationRow() {
      if (!this.isAutoReloadTopo) {
        this.handleReload();
      }
    }

    private mounted() {
      this.$router.push('/topology');
    }

    private handleReload() {
      this.rocketTopo.toolSetInstance.refreshTopoView();
      const params = {
        start_time: '',
        end_time: '',
      };
      if (this.isAutoReloadTopo) {
        // 开启轮询，查的是最近的时间段
        const gap = this.duration.end.getTime() - this.duration.start.getTime();
        const time: Date[] = [new Date(new Date().getTime() - gap), new Date()];
        this.SET_DURATION(timeFormat(time));

        params.start_time = dateFormat('YYYY-mm-dd HH:MM:SS', time[0]);
        params.end_time = dateFormat('YYYY-mm-dd HH:MM:SS', time[1]);
      } else {
        // 关闭轮询，可以查询任意时间段
        params.start_time = dateFormat('YYYY-mm-dd HH:MM:SS', this.duration.start);
        params.end_time = dateFormat('YYYY-mm-dd HH:MM:SS', this.duration.end);
      }
      this.GET_TOPO_DATA(params);
    }

    private handleAuto() {
      this.SET_IS_AUTO_RELOAD_TOPO(!this.isAutoReloadTopo);
      if (this.isAutoReloadTopo) {
        this.handleReload();
        this.timer = setInterval(this.handleReload, this.autoTime * 1000);
      } else {
        clearInterval(this.timer);
      }
    }

    private changeAutoTime() {
      clearInterval(this.timer);
      if (this.isAutoReloadTopo) {
        this.handleReload();
        this.timer = setInterval(this.handleReload, this.autoTime * 1000);
      }
    }
  }
</script>

<style lang="scss" scoped>
  .rk-header {
    height: 48px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding-right: 15px;
    padding-left: 15px;
    z-index: 999;
    flex-shrink: 0;
    justify-content: space-between;
    font-size: 13px;
    color: #efefef;
    background-color: #252a2f;
    box-shadow: 0 1px 2px 0 rgba(26, 24, 29, 0.24);

    .reload-static {
      pointer-events: none !important;
    }

    .hcs-logo {
      width: 28px;
      height: 28px;
      margin-right: 2px;
    }

    .hcs-title {
      font-size: 14px;
      margin-right: 10px;
      color: #ccc;
    }

    .nav-link {
      padding: 4px 10px;
      border-radius: 4px;
      opacity: 0.8;
      color: #efeff1;
      will-change: opacity, background-color;
      transition: opacity 0.3s, background-color 0.3s;
    }
    .nav-link:hover,
    .nav-link.active {
      opacity: 1;
      background-color: #333844;
    }

    .auto-time {
      .rk-auto-select {
        input {
          width: 38px;
          border-style: unset;
          border-radius: 3px;
          outline: 0;
        }
      }
    }
  }
</style>
