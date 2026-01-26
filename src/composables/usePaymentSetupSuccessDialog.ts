import { computed, onMounted, ref, watch, type ComputedRef, type Ref } from 'vue';
import type { IUser } from 'src/interfaces/user';

export const PAYMENT_SUCCESS_DIALOG_STORAGE_KEY = 'guestspot-payment-success-dialog-dismissed';

export const getPaymentSuccessDialogStorageKey = (userId?: string | null): string | null =>
  userId ? `${PAYMENT_SUCCESS_DIALOG_STORAGE_KEY}-${userId}` : null;

type PaymentSetupSuccessDialogOptions = {
  user: Ref<IUser | null> | ComputedRef<IUser | null>;
};

export const usePaymentSetupSuccessDialog = ({ user }: PaymentSetupSuccessDialogOptions) => {
  const showPaymentSuccessDialog = ref(true);
  const previousPayoutsEnabled = ref<boolean | undefined>(undefined);

  const paymentSuccessDialogStorageKey = computed(() => getPaymentSuccessDialogStorageKey(user.value?.id));

  const isPaymentSuccessDialogDismissed = computed(() => {
    const storageKey = paymentSuccessDialogStorageKey.value;
    if (!storageKey) {
      return false;
    }
    return localStorage.getItem(storageKey) === 'true';
  });

  const shouldShowPaymentSuccessDialog = computed(() => {
    if (!user.value?.id) {
      return false;
    }
    if (user.value?.payoutsEnabled !== true) {
      return false;
    }
    return !isPaymentSuccessDialogDismissed.value;
  });

  const checkAndShowPaymentSuccessDialog = () => {
    if (shouldShowPaymentSuccessDialog.value) {
      // Check if payoutsEnabled changed from false/undefined to true
      const currentPayoutsEnabled = user.value?.payoutsEnabled === true;
      const wasPayoutsEnabledBefore = previousPayoutsEnabled.value === true;

      if (currentPayoutsEnabled && !wasPayoutsEnabledBefore) {
        showPaymentSuccessDialog.value = true;
      }
    }
  };

  const handleDismissPaymentSuccessDialog = () => {
    const storageKey = paymentSuccessDialogStorageKey.value;
    if (storageKey) {
      localStorage.setItem(storageKey, 'true');
    }
    showPaymentSuccessDialog.value = false;
  };

  // Track previous payoutsEnabled value
  watch(
    () => user.value?.payoutsEnabled,
    (newValue, oldValue) => {
      // Update previous value after checking for changes
      if (oldValue !== undefined) {
        previousPayoutsEnabled.value = oldValue;
      }
    },
  );

  onMounted(() => {
    // Initialize previous value
    previousPayoutsEnabled.value = user.value?.payoutsEnabled;
  });

  return {
    showPaymentSuccessDialog,
    handleDismissPaymentSuccessDialog,
    checkAndShowPaymentSuccessDialog,
  };
};
