import { boot } from 'quasar/wrappers';
import { Capacitor } from '@capacitor/core';

export default boot(() => {
  // Initialize Stripe only on native platforms
  if (Capacitor.isNativePlatform()) {
    try {
      // Initialize Stripe with publishable key if needed
      // Note: For Stripe Connect onboarding, we just need to open URLs
      // The actual initialization with publishable key can be done when needed for payments
      console.log('Stripe plugin is ready for native platform');
    } catch (error) {
      console.error('Error initializing Stripe:', error);
    }
  }
});

