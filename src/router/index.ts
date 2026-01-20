import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
} from 'vue-router';
import routes from './routes';
import { useScrollStore } from 'src/stores/scroll';
import { useUserStore } from 'src/stores/user';
import { useTokens } from 'src/modules/useTokens';

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
    : createWebHashHistory;

  const scrollStore = useScrollStore();
  const getScrollContainer = () =>
    document.querySelector('#q-app') ?? null;
  const scrollToPosition = (top: number, behavior: ScrollBehavior = 'auto') => {
    const target = getScrollContainer();
    if (!target) {
      return;
    }
    if (typeof target.scrollTo === 'function') {
      target.scrollTo({ top, behavior });
      return;
    }
    target.scrollTop = top;
  };
  const scheduleScroll = (top: number, behavior: ScrollBehavior = 'auto') => {
    requestAnimationFrame(() => {
      scrollToPosition(top, behavior);
    });
  };

  const Router = createRouter({
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    if (requiresAuth) {
      const userStore = useUserStore();
      const { isAuthenticated } = useTokens();
      const hasSession = userStore.getIsAuthenticated || isAuthenticated();

      if (!hasSession) {
        next({ path: '/auth', query: { redirect: to.fullPath } });
        return;
      }
    }

    const QApp = getScrollContainer();
    const scrollY = QApp?.scrollTop ?? 0;
    if (from.meta.saveScrollPosition) {
      scrollStore.setScrollPosition(from.path, scrollY);
    }
    next();
  });

  Router.afterEach((to) => {
    if (to.meta.saveScrollPosition) {
      scheduleScroll(scrollStore.getScrollPosition(to.path) ?? 0);
      return;
    }
    scheduleScroll(0, 'smooth');
  });

  return Router;
});
