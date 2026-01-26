import {
  computed,
  onBeforeUnmount,
  ref,
  watch,
  type ComputedRef,
  type Ref,
} from 'vue';
import { UserType } from 'src/interfaces/enums';
import type { IUser } from 'src/interfaces/user';

const TIP_DIALOG_DELAY_MS = 8000;
const TIP_DIALOG_STORAGE_PREFIX = 'guestspot-tip-dialog';
const ACCEPT_TIPS_DIALOG_STORAGE_PREFIX = 'guestspot-accept-tips-dialog';

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
  const showAcceptTipsDialog = ref(false);
  const tipTimerId = ref<ReturnType<typeof setTimeout> | null>(null);
  const acceptTipsTimerId = ref<ReturnType<typeof setTimeout> | null>(null);

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

  const acceptTipsDialogStorageKey = computed(() => {
    const ownerId = profileOwner.value?.documentId;
    if (!ownerId) {
      return null;
    }
    return `${ACCEPT_TIPS_DIALOG_STORAGE_PREFIX}-${ownerId}`;
  });

  const tipAlreadyDismissed = computed(() => {
    const key = tipDialogStorageKey.value;
    return safeReadStorage(key) === 'true';
  });

  const acceptTipsAlreadyDismissed = computed(() => {
    const key = acceptTipsDialogStorageKey.value;
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

  const shouldShowAcceptTipsDialog = computed(() => {
    if (!profileOwner.value) {
      return false;
    }
    if (!isProfileOwner.value) {
      return false;
    }
    if (currentUser.value?.type !== UserType.Artist) {
      return false;
    }
    if (acceptTipsAlreadyDismissed.value) {
      return false;
    }
    if (profileOwner.value.payoutsEnabled === true) {
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

  const dismissAcceptTipsDialog = () => {
    const key = acceptTipsDialogStorageKey.value;
    if (key) {
      safeWriteStorage(key, 'true');
    }
    showAcceptTipsDialog.value = false;
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

  const handleAcceptTipsDialogToggle = (shouldShow: boolean) => {
    if (acceptTipsTimerId.value) {
      clearTimeout(acceptTipsTimerId.value);
      acceptTipsTimerId.value = null;
    }

    if (!shouldShow) {
      showAcceptTipsDialog.value = false;
      return;
    }

    acceptTipsTimerId.value = setTimeout(() => {
      showAcceptTipsDialog.value = true;
      acceptTipsTimerId.value = null;
    }, TIP_DIALOG_DELAY_MS);
  };

  watch(shouldShowTipDialog, handleTipDialogToggle, { immediate: true });
  watch(shouldShowAcceptTipsDialog, handleAcceptTipsDialogToggle, { immediate: true });

  onBeforeUnmount(() => {
    if (tipTimerId.value) {
      clearTimeout(tipTimerId.value);
    }
    if (acceptTipsTimerId.value) {
      clearTimeout(acceptTipsTimerId.value);
    }
  });

  return {
    showTipDialog,
    showAcceptTipsDialog,
    dismissTipDialog,
    dismissAcceptTipsDialog,
  };
};
