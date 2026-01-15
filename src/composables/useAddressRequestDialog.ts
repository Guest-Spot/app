import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import type { IUser } from 'src/interfaces/user';
import { hasUserAddress } from 'src/utils/address';

const ADDRESS_DIALOG_STORAGE_KEY = 'guestspot-address-dialog-dismissed';

type AddressDialogOptions = {
  user: Ref<IUser | null> | ComputedRef<IUser | null>;
  enabled: Ref<boolean> | ComputedRef<boolean>;
  onFillAddress?: () => void;
};

export const useAddressRequestDialog = ({
  user,
  enabled,
  onFillAddress,
}: AddressDialogOptions) => {
  const showAddressDialog = ref(false);

  const addressDialogStorageKey = computed(() => {
    const userId = user.value?.id;
    return userId ? `${ADDRESS_DIALOG_STORAGE_KEY}-${userId}` : null;
  });

  const isAddressDialogDismissed = computed(() => {
    const storageKey = addressDialogStorageKey.value;
    if (!storageKey) {
      return false;
    }
    return localStorage.getItem(storageKey) === 'true';
  });

  const shouldShowAddressDialog = computed(() => {
    if (!enabled.value || !user.value) {
      return false;
    }
    if (hasUserAddress(user.value)) {
      return false;
    }
    return !isAddressDialogDismissed.value;
  });

  watch(
    shouldShowAddressDialog,
    (shouldShow) => {
      showAddressDialog.value = shouldShow;
    },
    { immediate: true },
  );

  const dismissAddressDialog = () => {
    const storageKey = addressDialogStorageKey.value;
    if (storageKey) {
      localStorage.setItem(storageKey, 'true');
    }
    showAddressDialog.value = false;
  };

  const fillAddress = () => {
    showAddressDialog.value = false;
    onFillAddress?.();
  };

  return {
    showAddressDialog,
    dismissAddressDialog,
    fillAddress,
  };
};
