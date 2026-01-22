import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import type { IUser } from 'src/interfaces/user';
import { UserType } from 'src/interfaces/enums';

const ACCOUNT_TYPE_UPGRADE_DIALOG_KEY = 'guestspot-account-type-upgrade-dialog';
const ACCOUNT_TYPE_UPGRADE_DISMISSED_KEY = 'guestspot-account-type-upgrade-dismissed';

type AccountType = UserType.Artist | UserType.Shop;

type AccountTypeUpgradeDialogOptions = {
  user: Ref<IUser | null> | ComputedRef<IUser | null>;
  enabled: Ref<boolean> | ComputedRef<boolean>;
  accountType: AccountType;
};

const getStorageKey = (userId: string) => `${ACCOUNT_TYPE_UPGRADE_DIALOG_KEY}-${userId}`;
const getDismissedKey = (userId: string, accountType: AccountType) =>
  `${ACCOUNT_TYPE_UPGRADE_DISMISSED_KEY}-${userId}-${accountType}`;

const readStoredType = (storageKey: string): AccountType | null => {
  const stored = localStorage.getItem(storageKey);
  if (stored === UserType.Artist || stored === UserType.Shop) {
    return stored;
  }
  return null;
};

export const setAccountTypeUpgradeDialogPending = (userId: string, accountType: AccountType) => {
  localStorage.setItem(getStorageKey(userId), accountType);
};

export const useAccountTypeUpgradeDialog = ({
  user,
  enabled,
  accountType,
}: AccountTypeUpgradeDialogOptions) => {
  const showUpgradeDialog = ref(false);
  const pendingType = ref<AccountType | null>(null);
  const isDismissed = ref(false);

  const storageKey = computed(() => {
    const userId = user.value?.id;
    return userId ? getStorageKey(userId) : null;
  });

  const refreshPendingType = () => {
    const key = storageKey.value;
    const userId = user.value?.id;
    if (!key || !userId) {
      pendingType.value = null;
      isDismissed.value = false;
      return;
    }
    pendingType.value = readStoredType(key);
    isDismissed.value = localStorage.getItem(getDismissedKey(userId, accountType)) === 'true';
  };

  watch(storageKey, refreshPendingType, { immediate: true });

  const shouldShow = computed(() => {
    if (!enabled.value || !user.value) {
      return false;
    }
    if (isDismissed.value) {
      return false;
    }
    return pendingType.value === accountType;
  });

  watch(
    shouldShow,
    (value) => {
      if (!value) {
        return;
      }
      showUpgradeDialog.value = true;
      const key = storageKey.value;
      if (key) {
        localStorage.removeItem(key);
      }
      pendingType.value = null;
    },
    { immediate: true },
  );

  const triggerUpgradeDialog = () => {
    const userId = user.value?.id;
    if (!enabled.value || !userId) {
      return false;
    }

    const dismissed = localStorage.getItem(getDismissedKey(userId, accountType)) === 'true';
    if (dismissed) {
      isDismissed.value = true;
      return true;
    }

    showUpgradeDialog.value = true;
    const key = storageKey.value;
    if (key) {
      localStorage.removeItem(key);
    }
    pendingType.value = null;
    return true;
  };

  const dismissUpgradeDialog = () => {
    const userId = user.value?.id;
    if (userId) {
      localStorage.setItem(getDismissedKey(userId, accountType), 'true');
    }
    isDismissed.value = true;
    showUpgradeDialog.value = false;
  };

  return {
    showUpgradeDialog,
    triggerUpgradeDialog,
    dismissUpgradeDialog,
  };
};

export type { AccountType };
