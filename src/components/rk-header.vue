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
      <!-- <a class="rk-btn mr-5 sm" :class="auto ? 'blue' : 'ghost'" @click="handleAuto">
        <span class="vm">{{ this.$t('auto') }}</span>
      </a>
      <div class="auto-time">
        <span class="rk-auto-select">
          <input v-model="autoTime" type="number" @change="changeAutoTime" min="1" />
        </span>
        {{ this.$t('second') }}
      </div> -->
      <a class="rk-btn sm ghost" @click="handleReload">
        <svg class="icon mr-5 vm" :class="{ loading: auto }">
          <use xlink:href="#retry"></use>
        </svg>
        <span class="vm">{{ this.$t('reload') }}</span>
      </a>
    </div>
  </header>
</template>

<script lang="ts">
  import { Vue, Component } from 'vue-property-decorator';
  import { Action, State, Getter } from 'vuex-class';
  import timeFormat from '@/utils/timeFormat';

  @Component
  export default class Header extends Vue {
    @Getter('duration') private duration: any;
    @Action('SET_DURATION') private SET_DURATION: any;
    @Action('rocketTopo/GET_TOPO_DATA') public GET_TOPO_DATA: any;
    @State('rocketTopo') private rocketTopo: any;
    private show: boolean = false;
    private auto: boolean = false;
    private autoTime: number = 6;
    private timer: any = null;
    private dateFormat(fmt, date) {
      let ret;
      const opt = {
        'Y+': date.getFullYear().toString(), // 年
        'm+': (date.getMonth() + 1).toString(), // 月
        'd+': date.getDate().toString(), // 日
        'H+': date.getHours().toString(), // 时
        'M+': date.getMinutes().toString(), // 分
        'S+': date.getSeconds().toString(), // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
      };
      for (let k in opt) {
        ret = new RegExp('(' + k + ')').exec(fmt);
        if (ret) {
          fmt = fmt.replace(ret[1], ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, '0'));
        }
      }
      return fmt;
    }
    private handleReload() {
      this.rocketTopo.toolSetInstance.refreshTopo(false);
      this.GET_TOPO_DATA({
        start_time: this.dateFormat('YYYY-mm-dd HH:MM:SS', this.duration.start),
        end_time: this.dateFormat('YYYY-mm-dd HH:MM:SS', this.duration.end),
      });
      // const gap = this.duration.end.getTime() - this.duration.start.getTime();
      // const utcCopy: any = -(new Date().getTimezoneOffset() / 60);
      // const time: Date[] = [new Date(new Date().getTime() - gap), new Date()];
      // this.SET_DURATION(timeFormat(time));
    }
    private handleAuto() {
      // 开启轮询刷新 query queryServices($duration: Duration!,$keyword: String!)
      this.auto = !this.auto;
      if (this.auto) {
        this.handleReload();
        this.timer = setInterval(this.handleReload, this.autoTime * 1000);
      } else {
        clearInterval(this.timer);
      }
    }
    private handleHide() {
      this.show = false;
    }
    private handleShow() {
      this.show = !this.show;
    }
    private handleSignout() {
      localStorage.removeItem('skywalking-authority');
      this.$router.push('/login');
    }
    private changeAutoTime() {
      clearInterval(this.timer);
      if (this.auto) {
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
  }
  .rk-header-user {
    display: none;
    position: relative;
  }
  .rk-header-user-menu {
    position: absolute;
    top: 35px;
    right: 0;
    background-color: #fff;
    overflow: hidden;
    border-radius: 4px;
    padding: 3px 0;
    color: #333844;
    width: 100px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.15);
  }
  .rk-header-user-menu-i {
    padding: 6px 10px;
    will-change: background-color;
    transition: background-color 0.3s;
    &:hover {
      background-color: #dededf;
    }
  }
</style>
