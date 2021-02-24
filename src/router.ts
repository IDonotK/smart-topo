import Vue from 'vue';
import Router from 'vue-router';
import Index from './views/containers/index.vue';
import Topology from './views/containers/topology.vue';
import HelpCenter from './views/containers/help-center.vue';

Vue.use(Router);
window.axiosCancel = [];

const router = new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  linkActiveClass: 'active',
  routes: [
    {
      path: '/help-center',
      component: HelpCenter,
    },
    {
      path: '/',
      component: Index,
      children: [
        {
          path: 'topology',
          component: Topology,
        },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  const token = window.localStorage.getItem('skywalking-authority');
  if (window.axiosCancel.length !== 0) {
    for (const func of window.axiosCancel) {
      setTimeout(func(), 0);
    }
    window.axiosCancel = [];
  }
  next();
});

export default router;
