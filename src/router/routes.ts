import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'bookmarks', component: () => import('pages/BookmarksPage.vue') },
      { path: 'profile', component: () => import('pages/ProfilePage.vue') },
      { path: 'faq', component: () => import('pages/FAQPage.vue') },
      { path: 'tos', component: () => import('pages/TOSPage.vue') },
      { path: 'privacy', component: () => import('pages/PrivacyPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
