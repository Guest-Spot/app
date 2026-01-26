import {
  computed,
  onBeforeUnmount,
  ref,
  watch,
  type ComputedRef,
  type Ref,
} from 'vue';
import type { IUser } from 'src/interfaces/user';

const TIP_DIALOG_DELAY_MS = 8000;
const TIP_DIALOG_STORAGE_PREFIX = 'guestspot-tip-dialog';

type UseTipDialogOptions = {
  profileOwner: Ref<IUser | null> | ComputedRef<IUser | null>;
  currentUser: Ref<IUser | null> | ComputedRef<IUser | null>;
};

const hasLocalStorage = typeof window !== 'undefined' && 'localStorage' in window;

const safeReadStorage = (key?: string | null) => {
  if (!key || !hasLocalStorage) return null;
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn('LocalStorage not available:', error);
    return null;
  }
};

const safeWriteStorage = (key: string, value: string) => {
  if (!hasLocalStorage) return;
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn('LocalStorage not available:', error);
  }
};

export const useTipDialog = ({ profileOwner, currentUser }: UseTipDialogOptions) => {
  const showTipDialog = ref(false);
  const tipTimerId = ref<ReturnType<typeof setTimeout> | null>(null);

  const isProfileOwner = computed(() => {
    if (!currentUser.value || !profileOwner.value) {
      return false;
    }
    return currentUser.value.documentId === profileOwner.value.documentId;
  });

  const tipDialogStorageKey = computed(() => {
    const ownerId = profileOwner.value?.documentId;
    if (!ownerId) {
      return null;
    }
    const userId = currentUser.value?.id ?? 'guest';
    return `${TIP_DIALOG_STORAGE_PREFIX}-${ownerId}-${userId}`;
  });

  const tipAlreadyDismissed = computed(() => {
    const key = tipDialogStorageKey.value;
    return safeReadStorage(key) === 'true';
  });

  const shouldShowTipDialog = computed(() => {
    if (!profileOwner.value) {
      return false;
    }
    if (isProfileOwner.value) {
      return false;
    }
    if (profileOwner.value.payoutsEnabled !== true) {
      return false;
    }
    if (tipAlreadyDismissed.value) {
      return false;
    }
    return true;
  });

  const dismissTipDialog = () => {
    const key = tipDialogStorageKey.value;
    if (key) {
      safeWriteStorage(key, 'true');
    }
    showTipDialog.value = false;
  };

  const handleTipDialogToggle = (shouldShow: boolean) => {
    if (tipTimerId.value) {
      clearTimeout(tipTimerId.value);
      tipTimerId.value = null;
    }

    if (!shouldShow) {
      showTipDialog.value = false;
      return;
    }

    tipTimerId.value = setTimeout(() => {
      showTipDialog.value = true;
      tipTimerId.value = null;
    }, TIP_DIALOG_DELAY_MS);
  };

  watch(shouldShowTipDialog, handleTipDialogToggle, { immediate: true });

  onBeforeUnmount(() => {
    if (tipTimerId.value) {
      clearTimeout(tipTimerId.value);
    }
  });

  return {
    showTipDialog,
    dismissTipDialog,
  };
};
