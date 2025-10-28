export default function useStripe() {
  /**
   * Open Stripe URL in browser
   * Works on both web and native platforms
   */
  const openStripeUrl = (url: string): void => {
    try {
      // Open in new tab/window - works on both web and native platforms
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening Stripe URL:', error);
      throw error;
    }
  };

  return {
    openStripeUrl,
  };
}

