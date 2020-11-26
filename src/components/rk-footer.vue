<template>
  <footer class="rk-footer trans" :class="{ 'rk-footer-dark': $route.path === '/topology' }">
    <div class="rk-footer-inner">
      <div class="flex-h"></div>
      <div class="sm flex-h">
        <RkFooterTime />
        <!-- <span class="mr-15 cp" @click="setLang">{{ lang === 'zh' ? '中' : 'En' }}</span> -->
        <!-- <span>{{ $t('serverZone') }} UTC {{ utc >= 0 ? '+' : '' }}</span
        ><input v-model="utc" min="-12" max="14" class="rk-footer-utc" type="number" /> -->
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
  import { Duration } from '@/types/global';
  import { Vue, Component, Watch } from 'vue-property-decorator';
  import { State, Action, Mutation } from 'vuex-class';

  @Component
  export default class Footerssd extends Vue {
    @State('rocketbot') private rocketbotGlobal: any;
    @Action('SET_DURATION') private SET_DURATION: any;
    @Action('SET_UTC') private SET_UTC: any;
    private lang: any = '';
    private utc: any = window.localStorage.getItem('utc') || -(new Date().getTimezoneOffset() / 60);
    @Watch('utc')
    private onUtcUpdate() {
      if (this.utc < -12) {
        this.utc = -12;
      }
      if (this.utc > 14) {
        this.utc = 14;
      }
      if (this.utc === '') {
        this.utc = 0;
      }
      this.SET_UTC(this.utc);
      window.localStorage.setItem('utc', this.utc.toString());
    }
    private setLang() {
      if (this.lang === 'zh') {
        this.$i18n.locale = 'en';
        window.localStorage.setItem('lang', 'en');
        this.lang = 'en';
      } else {
        this.$i18n.locale = 'zh';
        window.localStorage.setItem('lang', 'zh');
        this.lang = 'zh';
      }
    }
    private beforeMount() {
      this.lang = window.localStorage.getItem('lang');
    }
  }
</script>

<style scoped>
  .rk-footer {
    position: fixed;
    height: 30px;
    bottom: 0;
    left: 0;
    right: 0;
    padding-right: 15px;
    padding-left: 15px;
    padding-bottom: 1px;
    z-index: 999;
    color: #515a6e;
    flex-shrink: 0;
    box-shadow: 0 -1px 0px rgba(0, 0, 0, 0.08);
  }
  .rk-footer-dark {
    color: #ddd;
    background: #252a2f;
    border-top: 1px solid #252a2f;
  }
  .rk-footer-edit {
    color: #eee;
    background: #448dfe;
    border-top: 1px solid #448dfe;
  }
  .rk-footer-utc {
    color: inherit;
    background: 0;
    border: 0;
    outline: none;
    width: 40px;
    padding-bottom: 0;
  }
  .rk-footer-inner {
    justify-content: space-between;
    display: flex;
  }
</style>
