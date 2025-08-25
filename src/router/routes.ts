import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { title: 'Authentication' },
    children: [
      { path: '', component: () => import('pages/AuthPage.vue') },
    ],
  },
  {
    path: '/login/shop',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { title: 'Shop Login' },
    children: [
      { path: '', component: () => import('pages/ShopLoginPage.vue') },
    ],
  },
  {
    path: '/login/artist',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { title: 'Artist Login' },
    children: [
      { path: '', component: () => import('pages/ArtistLoginPage.vue') },
    ],
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: '', 
        component: () => import('pages/IndexPage.vue'),
        meta: { title: 'GuestSpot' }
      },
      { 
        path: 'bookmarks', 
        component: () => import('pages/BookmarksPage.vue'),
        meta: { title: 'Bookmarks' }
      },
      { 
        path: 'profile', 
        component: () => import('src/pages/ProfileRouter.vue'),
        meta: { title: 'Profile' }
      },
      { 
        path: 'faq', 
        component: () => import('pages/FAQPage.vue'),
        meta: { title: 'FAQ' }
      },
      { 
        path: 'tos', 
        component: () => import('pages/TOSPage.vue'),
        meta: { title: 'Terms of Service' }
      },
      { 
        path: 'privacy', 
        component: () => import('pages/PrivacyPage.vue'),
        meta: { title: 'Privacy Policy' }
      },
    ],
  },
  {
    path: '/artist/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: '', 
        component: () => import('pages/PublicArtistProfile.vue'),
        meta: { title: 'Artist Profile', hasBack: true }
      },
    ],
  },
  {
    path: '/shop/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: '', 
        component: () => import('pages/PublicShopProfile.vue'),
        meta: { title: 'Shop Profile', hasBack: true }
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { 
        path: '', 
        component: () => import('pages/ErrorNotFound.vue'),
        meta: { title: 'Page Not Found' }
      },
    ],
  },
];

export default routes;
