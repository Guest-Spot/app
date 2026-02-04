import { ref } from 'vue';
import { Purchases, type PurchasesOfferings, type PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { Platform } from 'quasar';
import useNotify from 'src/modules/useNotify';

// Keys are loaded from .env file and exposed via quasar.config.ts
const API_KEY_IOS = process.env.REVENUECAT_API_KEY_IOS as string; 
const API_KEY_ANDROID = process.env.REVENUECAT_API_KEY_ANDROID as string;

export default function useProjectDonation() {
  const { showError, showSuccess } = useNotify();
  const offerings = ref<PurchasesOfferings | null>(null);
  const packages = ref<PurchasesPackage[]>([]);
  const isReady = ref(false);
  const isLoading = ref(false);
  const isPurchasing = ref(false);

  const init = async () => {
    isLoading.value = true;
    if (!Platform.is.capacitor) {
      console.warn('RevenueCat not available on web. Run on device to test donations.');
      isLoading.value = false;
      return;
    }

    try {
      if (Platform.is.ios) {
         await Purchases.configure({ apiKey: API_KEY_IOS });
      } else if (Platform.is.android) {
         await Purchases.configure({ apiKey: API_KEY_ANDROID });
      }
      
      const offeringsData = await Purchases.getOfferings();
      if (offeringsData.current) {
        offerings.value = offeringsData;
        packages.value = offeringsData.current.availablePackages;
      } else {
        // Fallback or empty state
        console.log('No current offerings found');
      }
      isReady.value = true;
    } catch (e) {
      console.error('Failed to init RevenueCat', e);
      showError('Failed to initialize donation system');
    } finally {
        isLoading.value = false;
    }
  };

  const purchasePackage = async (pkg: PurchasesPackage) => {
    if (!Platform.is.capacitor) {
       showSuccess(`Mock purchase of ${pkg.product.title} successful!`);
       return;
    }
    
    try {
      isPurchasing.value = true;
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
      console.log('Purchase successful', customerInfo);
      showSuccess('Thank you for your donation!');
    } catch (e: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = e as any;
      if (!error.userCancelled) {
        console.error('Purchase failed', error);
        showError(error.message || 'Purchase failed');
      }
    } finally {
      isPurchasing.value = false;
    }
  };

  return {
    init,
    packages,
    purchasePackage,
    isLoading,
    isPurchasing
  };
}
