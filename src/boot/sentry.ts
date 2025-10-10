import { boot } from 'quasar/wrappers';
import * as Sentry from '@sentry/vue';
import { Capacitor } from '@capacitor/core';
import { init as initSentryCapacitor } from '@sentry/capacitor';

declare module 'vue' {
  interface ComponentCustomProperties {
    $sentry: typeof Sentry;
  }
}

const parseRate = (value?: string): number | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export default boot(({ app, router }) => {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    return;
  }

  const sentryOptions: Sentry.BrowserOptions = {
    app,
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE,
    integrations: [],
    sendClientReports: true,
  };

  if (router) {
    const routingIntegration = Sentry.browserTracingIntegration({
      router,
    });
    sentryOptions.integrations?.push(routingIntegration);
  }

  const tracesSampleRate = parseRate(process.env.SENTRY_TRACES_SAMPLE_RATE);
  if (typeof tracesSampleRate === 'number') {
    sentryOptions.tracesSampleRate = tracesSampleRate;
  }

  Sentry.init(sentryOptions);
  app.config.globalProperties.$sentry = Sentry;

  const platform = Capacitor.getPlatform();
  Sentry.setTag('capacitor-platform', platform);

  if (Capacitor.isNativePlatform()) {
    initSentryCapacitor({
      dsn,
      debug: process.env.SENTRY_DEBUG === 'true',
      enableNative: true,
      environment: sentryOptions.environment,
      release: sentryOptions.release,
    });
  }
});
