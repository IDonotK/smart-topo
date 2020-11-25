import Vue from 'vue';
import moment from 'dayjs';
import clickout from '@/utils/clickout';
import tooltip from '@/utils/tooltip';
import zh from '@/assets/lang/zh';
import en from '@/assets/lang/en';
import VueI18n from 'vue-i18n';
import eventBus from './event-bus';
import App from './App.vue';
import router from './router';
import store from './store';
import components from './components';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/graph';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/scatter';
import 'echarts/lib/chart/heatmap';
import 'echarts/lib/chart/sankey';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import VModal from 'vue-js-modal';
import { queryOAPTimeInfo } from './utils/localtime';
import './assets';

// import ElementUI from 'element-ui';
// import 'element-ui/lib/theme-chalk/index.css';
// import './assets/themedark/index.css';
// Vue.use(ElementUI);
import { Button, Dialog, MessageBox, Radio, Input } from 'element-ui';
Vue.prototype.$ELEMENT = { size: 'small', zIndex: 3000 };
Vue.use(Button);
Vue.use(Dialog);
Vue.use(Radio);
Vue.use(Input);
Vue.prototype.$confirm = MessageBox.confirm;

// import $ from 'jquery';
// Vue.prototype.$jq = $;

Vue.use(eventBus);
Vue.use(VueI18n);
Vue.use(components);
Vue.use(VModal, { dialog: true });
Vue.directive('clickout', clickout);
Vue.directive('tooltip', tooltip);

Vue.filter('dateformat', (dataStr: any, pattern: string = 'YYYY-MM-DD HH:mm:ss') => moment(dataStr).format(pattern));

const savedLanguage = window.localStorage.getItem('lang');
let language = navigator.language.split('-')[0];
if (!savedLanguage) {
  window.localStorage.setItem('lang', language);
}
language = savedLanguage ? savedLanguage : language;

const i18n = new VueI18n({
  locale: language,
  messages: {
    zh,
    en,
  },
});

if (!window.Promise) {
  window.Promise = Promise;
}

Vue.config.productionTip = false;

new Vue({
  i18n,
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
