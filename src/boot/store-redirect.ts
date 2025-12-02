import { boot } from 'quasar/wrappers';
import { IOS_STORE_URL, ANDROID_STORE_URL, WEB_FALLBACK } from 'src/config/constants';

export default boot(({ router }) => {
  router.beforeEach((to, from, next) => {
    if (to.path === '/store-redirect') {
      const ua = navigator.userAgent.toLowerCase();

      if (/iphone|ipad|ipod/.test(ua)) {
        window.location.href = IOS_STORE_URL;
        return;
      }

      if (/android/.test(ua)) {
        window.location.href = ANDROID_STORE_URL;
        return;
      }

      window.location.href = WEB_FALLBACK;
      return;
    }

    next();
  });
});
