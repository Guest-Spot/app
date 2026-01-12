import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
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
    path: '/',
    component: () => import('layouts/SimpleLayout.vue'),
    children: [
      {
        path: 'auth',
        component: () => import('pages/AuthPage.vue'),
        meta: { title: 'Welcome to GuestSpot' },
      },
      {
        path: 'reset-password',
        component: () => import('pages/ResetPasswordPage.vue'),
        meta: { title: 'Reset Password' },
      },
      {
        path: 'forgot-password',
        component: () => import('pages/ForgotPasswordPage.vue'),
        meta: { title: 'Forgot Password' },
      },
      {
        path: 'sign-in',
        component: () => import('pages/SignInPage.vue'),
        meta: { title: 'Sign In' },
      },
      {
        path: 'sign-up',
        component: () => import('pages/SignUpPage.vue'),
        meta: { title: 'Create Account' },
      },
      {
        path: 'confirm/email',
        component: () => import('pages/ConfirmEmailPage.vue'),
        meta: { title: 'Email Confirmation' },
      },
      {
        path: 'connect/:provider',
        component: () => import('pages/connect/Provider.vue'),
        name: 'ConnectProvider',
      },
      {
        path: 'payment-success',
        component: () => import('pages/PaymentSuccessPage.vue'),
        name: 'Payment Success',
      },
      {
        path: 'payment-failure',
        component: () => import('pages/PaymentFailurePage.vue'),
        name: 'Payment Failure',
      },
      {
        path: 'create-booking',
        component: () => import('pages/CreateBookingPage.vue'),
        name: 'CreateBooking',
        meta: { title: 'Create Booking Request' },
      },
      {
        path: 'portfolio',
        component: () => import('pages/PortfolioPage.vue'),
        name: 'Portfolio',
        meta: { title: 'Portfolio Work' },
      },
      {
        path: 'stripe-onboarding-success',
        component: () => import('pages/StripeOnboardingSuccessPage.vue'),
        name: 'Stripe Onboarding Success',
      },
      {
        path: 'stripe-onboarding-expired',
        component: () => import('pages/StripeOnboardingExpiredPage.vue'),
        name: 'Stripe Onboarding Expired',
      },
      {
        path: 'artist/:documentId',
        component: () => import('pages/PublicArtistProfile.vue'),
        meta: { title: 'Artist Profile', hasBack: true },
      },
      {
        path: 'profile/basic-information',
        component: () => import('pages/profile/BasicInformationPage.vue'),
        meta: { title: 'Basic Information', requiresAuth: true },
      },
      {
        path: 'profile/location',
        component: () => import('pages/profile/LocationPage.vue'),
        meta: { title: 'Location', requiresAuth: true },
      },
      {
        path: 'profile/contacts',
        component: () => import('pages/profile/ContactsPage.vue'),
        meta: { title: 'Contacts', requiresAuth: true },
      },
      {
        path: 'profile/working-hours',
        component: () => import('pages/profile/WorkingHoursPage.vue'),
        meta: { title: 'Working Hours', requiresAuth: true },
      },
      {
        path: 'profile/additional-information',
        component: () => import('pages/profile/AdditionalInformationPage.vue'),
        meta: { title: 'Additional Information', requiresAuth: true },
      },
      {
        path: 'profile/social-media',
        component: () => import('pages/profile/SocialMediaPage.vue'),
        meta: { title: 'Social Media', requiresAuth: true },
      },
      {
        path: 'profile/payment-settings',
        component: () => import('pages/profile/PaymentSettingsPage.vue'),
        meta: { title: 'Payment Settings', requiresAuth: true },
      },
      {
        path: 'shop/:documentId',
        component: () => import('pages/PublicShopProfile.vue'),
        meta: { title: 'Shop Profile', hasBack: true },
      },
      {
        path: 'store-redirect',
        name: 'StoreRedirect',
        component: () => import('pages/StoreRedirect.vue'),
        meta: { title: 'Store Redirect' },
      },
      // Always leave this as last one,
      // but you can also remove it
      {
        path: ':catchAll(.*)*',
        component: () => import('pages/ErrorNotFound.vue'),
        meta: { title: 'Page Not Found' },
      },
    ],
  },
];

export default routes;
