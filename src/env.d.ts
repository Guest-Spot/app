declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
    APP_VERSION: string | undefined;
    SENTRY_DSN: string | undefined;
    SENTRY_ENVIRONMENT: string | undefined;
    SENTRY_RELEASE: string | undefined;
    SENTRY_TRACES_SAMPLE_RATE: string | undefined;
    SENTRY_DEBUG: string | undefined;
    SENTRY_ORG: string | undefined;
    SENTRY_PROJECT: string | undefined;
    SENTRY_AUTH_TOKEN: string | undefined;
    PUSH_NOTIFICATIONS_REGISTER_ENDPOINT: string | undefined;
    PUSH_NOTIFICATIONS_UNREGISTER_ENDPOINT: string | undefined;
    GOOGLE_MAPS_API_KEY: string | undefined;
  }
}

declare module 'vue-virtual-scroller';
