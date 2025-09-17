import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useScrollStore } from 'src/stores/scroll';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const scrollStore = useScrollStore();

  const Router = createRouter({
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to, from, next) => {
    const QApp = document.querySelector('#q-app');
    const scrollY = QApp?.scrollTop;
    setTimeout(() => {
      if (from.meta.saveScrollPosition) {
        scrollStore.setScrollPosition(from.path, scrollY || 0);
      }
      if (to.meta.saveScrollPosition) {
        QApp?.scrollTo({
          top: scrollStore.getScrollPosition(to.path),
        });
      }
    }, 0);
    next();
  });

  Router.afterEach((to) => {
    const QApp = document.querySelector('#q-app');
    if (!to.meta.saveScrollPosition) {
      QApp?.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  });

  return Router;
});
