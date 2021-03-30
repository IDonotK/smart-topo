<template>
  <header class="rk-header flex-h">
    <div class="flex-h hcs-header">
      <svg class="icon hcs-logo">
        <use xlink:href="#huawei"></use>
      </svg>
      <span class="grey hcs-title">{{ $t('rkHeader_product_title') }}</span>
      <router-link class="nav-link mr-20" to="/topology">
        <svg class="icon sm vm">
          <use xlink:href="#issues"></use>
        </svg>
        <span class="vm hide-xs ml-5">{{ $t('rkHeader_navigation_topology') }}</span>
      </router-link>
    </div>
    <div class="flex-h">
      <a :class="['rk-btn', 'mr-5', 'sm', isAutoReloadTopo ? 'blue' : 'ghost']" @click="handleAuto">
        <span class="vm">{{ $t('auto') }}</span>
      </a>
      <div class="auto-time">
        <span class="rk-auto-select" :title="$t('rkHeader_autoTime_tip')">
          <input v-model="autoTime" type="number" min="10" max="3600" @change="changeAutoTime" @focus="focusAutoTime" />
        </span>
        {{ $t('second') }}
      </div>
      <a :class="['rk-btn', 'sm', 'ghost', 'mr-5', isAutoReloadTopo ? 'reload-static' : '']" @click="handleReload">
        <svg :class="['icon', 'mr-5', 'vm', isAutoReloadTopo ? 'loading' : '']">
          <use xlink:href="#retry"></use>
        </svg>
        <span class="vm">{{ $t('reload') }}</span>
      </a>
      <router-link tag="a" class="rk-btn sm ghost" target="_blank" to="/help-center">
        <span class="vm">{{ $t('rkHeader_navigation_helpCenter') }}</span>
      </router-link>
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
  @Mutation('rocketTopo/SET_IS_AUTO_RELOAD_TOPO') private SET_IS_AUTO_RELOAD_TOPO: any;

  private autoTime = 10;
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

  private mounted() {
    if (this.$route.path === '/') {
      this.$router.push('/topology');
    }
  }

  private handleReload() {
    let gap = this.duration.end.getTime() - this.duration.start.getTime();
    let endTime = new Date();
    let startTime = new Date(endTime.getTime() - gap);
    this.rocketTopo.topoTimeInstance.setDateTimes(startTime, endTime);
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
    this.SET_IS_AUTO_RELOAD_TOPO(false);
    if (this.autoTime < 10) {
      this.autoTime = 10;
    }
    if (this.autoTime > 3600) {
      this.autoTime = 3600;
    }
  }

  private focusAutoTime() {
    this.SET_IS_AUTO_RELOAD_TOPO(false);
  }

  private beforeDestroy() {
    clearInterval(this.timer);
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

    .rk-btn.ghost {
        background-color: darkslategrey;
    }

    .auto-time {
        margin-right: 3px;

        .rk-auto-select {
            input {
                width: 52px;
                border-style: unset;
                border-radius: 3px;
                outline: 0;
            }
        }
    }
}
</style>
