import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

export default function useStripe() {
  /**
   * Open Stripe URL in browser
   * Works on both web and native platforms
   * On native: opens in-app browser
   * On web: opens in new tab
   */
  const openStripeUrl = async (url: string): Promise<void> => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Open in in-app browser on native platforms (iOS/Android)
        await Browser.open({
          url,
          presentationStyle: 'popover', // 'fullscreen' or 'popover'
        });
      } else {
        // Open in new tab on web
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error opening Stripe URL:', error);
      throw error;
    }
  };

  /**
   * Close the in-app browser
   * Useful if you need to programmatically close the browser
   */
  const closeBrowser = async (): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
      await Browser.close();
    }
  };

  /**
   * Add listener for browser finished event
   * This fires when user closes the in-app browser
   */
  const addBrowserFinishedListener = (callback: () => void) => {
    if (Capacitor.isNativePlatform()) {
      void Browser.addListener('browserFinished', callback);
    }
  };

  /**
   * Remove all browser listeners
   */
  const removeAllBrowserListeners = async () => {
    if (Capacitor.isNativePlatform()) {
      await Browser.removeAllListeners();
    }
  };

  return {
    openStripeUrl,
    closeBrowser,
    addBrowserFinishedListener,
    removeAllBrowserListeners,
  };
}

