import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/sign-in',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { title: 'Sign In' },
    children: [{ path: '', component: () => import('pages/SignInPage.vue') }],
  },
  {
    path: '/sign-up',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { title: 'Sign Up' },
    children: [{ path: '', component: () => import('pages/SignUpPage.vue') }],
  },
  {
    path: '/connect/:provider',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('pages/connect/Provider.vue') }],
    name: 'ConnectProvider',
  },
  {
    path: '/payment-success',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('pages/PaymentSuccessPage.vue') }],
    name: 'Payment Success',
  },
  {
    path: '/payment-failure',
    component: () => import('layouts/AuthLayout.vue'),
    children: [{ path: '', component: () => import('pages/PaymentFailurePage.vue') }],
    name: 'Payment Failure',
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        meta: { title: 'Search Page', saveScrollPosition: true },
      },
      {
        path: 'bookmarks',
        component: () => import('pages/BookmarksPage.vue'),
        meta: { title: 'Bookmarks' },
      },
      {
        path: 'events',
        component: () => import('src/pages/EventsPage.vue'),
        meta: { title: 'My Trips & Bookings' },
      },
      {
        path: 'bookings',
        component: () => import('pages/BookingsPage.vue'),
        meta: { title: 'Shop Bookings' },
      },
      {
        path: 'my-bookings',
        component: () => import('pages/MyBookingsPage.vue'),
        meta: { title: 'My Booking Requests' },
      },
      {
        path: 'profile',
        component: () => import('src/pages/ProfileRouter.vue'),
        meta: { title: 'My Profile' },
      },
      {
        path: 'faq',
        component: () => import('pages/FAQPage.vue'),
        meta: { title: 'FAQ' },
      },
      {
        path: 'tos',
        component: () => import('pages/TOSPage.vue'),
        meta: { title: 'Terms of Service' },
      },
      {
        path: 'privacy',
        component: () => import('pages/PrivacyPage.vue'),
        meta: { title: 'Privacy Policy' },
      },
      {
        path: 'feedback',
        component: () => import('pages/FeedbackPage.vue'),
        meta: { title: 'Feedback', requiresAuth: true },
      },
      {
        path: 'change-password',
        component: () => import('pages/ChangePasswordPage.vue'),
        meta: { title: 'Change Password', requiresAuth: true },
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
        meta: { title: 'Artist Profile', hasBack: true },
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
        meta: { title: 'Shop Profile', hasBack: true },
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
        meta: { title: 'Page Not Found' },
      },
    ],
  },
];

export default routes;
