import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: () => import('layouts/SimpleLayout.vue'),
    meta: { title: 'Welcome to GuestSpot' },
    children: [{ path: '', component: () => import('pages/AuthPage.vue') }],
  },
  {
    path: '/reset-password',
    component: () => import('layouts/SimpleLayout.vue'),
    meta: { title: 'Reset Password' },
    children: [{ path: '', component: () => import('pages/ResetPasswordPage.vue') }],
  },
  {
    path: '/sign-in',
    component: () => import('layouts/SimpleLayout.vue'),
    meta: { title: 'Sign In' },
    children: [{ path: '', component: () => import('pages/SignInPage.vue') }],
  },
  {
    path: '/sign-up',
    component: () => import('layouts/SimpleLayout.vue'),
    meta: { title: 'Create Account' },
    children: [{ path: '', component: () => import('pages/SignUpPage.vue') }],
  },
  {
    path: '/confirm/email',
    component: () => import('layouts/SimpleLayout.vue'),
    meta: { title: 'Email Confirmation' },
    children: [{ path: '', component: () => import('pages/ConfirmEmailPage.vue') }],
  },
  {
    path: '/connect/:provider',
    component: () => import('layouts/SimpleLayout.vue'),
    children: [{ path: '', component: () => import('pages/connect/Provider.vue') }],
    name: 'ConnectProvider',
  },
  {
    path: '/payment-success',
    component: () => import('layouts/SimpleLayout.vue'),
    children: [{ path: '', component: () => import('pages/PaymentSuccessPage.vue') }],
    name: 'Payment Success',
  },
  {
    path: '/payment-failure',
    component: () => import('layouts/SimpleLayout.vue'),
    children: [{ path: '', component: () => import('pages/PaymentFailurePage.vue') }],
    name: 'Payment Failure',
  },
  {
    path: '/create-booking',
    component: () => import('layouts/SimpleLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/CreateBookingPage.vue'),
        name: 'CreateBooking',
        meta: { title: 'Create Booking Request' },
      },
    ],
  },
  {
    path: '/portfolio',
    component: () => import('layouts/SimpleLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/PortfolioPage.vue'),
        name: 'Portfolio',
        meta: { title: 'Portfolio Work' },
      },
    ],
  },
  {
    path: '/stripe-onboarding-success',
    component: () => import('layouts/SimpleLayout.vue'),
    children: [{ path: '', component: () => import('pages/StripeOnboardingSuccessPage.vue') }],
    name: 'Stripe Onboarding Success',
  },
  {
    path: '/stripe-onboarding-expired',
    component: () => import('layouts/SimpleLayout.vue'),
    children: [{ path: '', component: () => import('pages/StripeOnboardingExpiredPage.vue') }],
    name: 'Stripe Onboarding Expired',
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Index',
        component: () => import('pages/IndexPage.vue'),
        meta: { title: 'Search Page', saveScrollPosition: true },
      },
      {
        path: 'feed',
        name: 'Feed',
        component: () => import('pages/FeedPage.vue'),
        meta: { title: 'Feed', saveScrollPosition: true, keepAlive: true },
      },
      {
        path: 'bookmarks',
        component: () => import('pages/BookmarksPage.vue'),
        meta: { title: 'Bookmarks', saveScrollPosition: true },
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
    component: () => import('layouts/SimpleLayout.vue'),
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
    component: () => import('layouts/SimpleLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/PublicShopProfile.vue'),
        meta: { title: 'Shop Profile', hasBack: true },
      },
    ],
  },
  {
    path: '/store-redirect',
    component: () => import('layouts/SimpleLayout.vue'),
    children: [{ path: '', component: () => import('pages/StoreRedirect.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('layouts/SimpleLayout.vue'),
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
