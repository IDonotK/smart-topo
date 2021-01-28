import Vue from 'vue';
import moment from 'dayjs';
import clickout from '@/utils/clickout';
import tooltip from '@/utils/tooltip';
import '@/utils/http';
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
import './assets';

import * as d3 from 'd3';
import d3tip from 'd3-tip';
import $ from 'jquery';
Vue.prototype.$d3 = d3;
Vue.prototype.$d3tip = d3tip;
Vue.prototype.$jq = $;

import {
  Button,
  Dialog,
  MessageBox,
  Radio,
  Input,
  Checkbox,
  Message,
  Form,
  FormItem,
  Drawer,
  Table,
  TableColumn,
  Tooltip,
  Pagination,
  Autocomplete,
  DatePicker,
} from 'element-ui';
// import './assets/styles/fix-element-ui.scss';
Vue.prototype.$ELEMENT = { size: 'small', zIndex: 99999 };
Vue.use(Button);
Vue.use(Dialog);
Vue.use(Radio);
Vue.use(Input);
Vue.use(Checkbox);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Drawer);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Tooltip);
Vue.use(Pagination);
Vue.use(Autocomplete);
Vue.use(DatePicker);
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$message = Message;

import 'overlayscrollbars/css/OverlayScrollbars.css';
import OverlayScrollbars from 'overlayscrollbars';
import { OverlayScrollbarsPlugin } from 'overlayscrollbars-vue';
Vue.use(OverlayScrollbarsPlugin);
Vue.use(OverlayScrollbars);

import 'xe-utils';
import VXETable from 'vxe-table';
// import 'vxe-table/lib/style.css';
import './assets/styles/fix-vxe-table.scss';
VXETable.setup({
  zIndex: 99999,
});
Vue.use(VXETable);

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
