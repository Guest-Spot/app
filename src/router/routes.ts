import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/sign-in',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { title: 'Sign In' },
    children: [
      { path: '', component: () => import('pages/SignInPage.vue') },
    ],
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        meta: { title: 'Search Page' }
      },
      {
        path: 'bookmarks',
        component: () => import('pages/BookmarksPage.vue'),
        meta: { title: 'Bookmarks' }
      },
      {
        path: 'trips-bookings',
        component: () => import('pages/TripsBookingsPage.vue'),
        meta: { title: 'My Trips & Bookings', requiresAuth: true }
      },
      {
        path: 'bookings',
        component: () => import('pages/BookingsPage.vue'),
        meta: { title: 'Shop Bookings', requiresAuth: true }
      },
      {
        path: 'profile',
        component: () => import('src/pages/ProfileRouter.vue'),
        meta: { title: 'My Profile', requiresAuth: true }
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
    path: '/artist/:documentId',
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
    path: '/shop/:documentId',
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
