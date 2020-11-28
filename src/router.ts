import Vue from 'vue';
import Router from 'vue-router';
import Login from './views/containers/login.vue';
import Index from './views/containers/index.vue';
import Dashboard from './views/containers/dashboard.vue';
import Trace from './views/containers/trace.vue';
import Topology from './views/containers/topology/topology.vue';
import Alarm from './views/containers/alarm.vue';
import Profile from './views/containers/profile.vue';

Vue.use(Router);
window.axiosCancel = [];

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  linkActiveClass: 'active',
  routes: [
    // {
    //   path: '/login',
    //   component: Login,
    //   meta: { login: true },
    // },
    {
      path: '/',
      component: Index,
      children: [
        // {
        //   path: 'dashboard',
        //   component: Dashboard,
        // },
        // {
        //   path: 'trace',
        //   component: Trace,
        // },
        {
          path: 'topology',
          component: Topology,
        },
        // {
        //   path: 'alarm',
        //   component: Alarm,
        // },
        // {
        //   path: 'profile',
        //   component: Profile,
        // },
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
  // if (to.meta.login && (token === null || token === 'guest')) {
  //   next();
  // } else if (token === null || token === 'guest') {
  //   next('/login');
  // } else if (to.meta.login) {
  //   next(from.path);
  // } else {
  //   next();
  // }
  next();
});

export default router;
