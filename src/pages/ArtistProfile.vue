<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <AddressRequestDialog
      v-model="showAddressDialog"
      @dismiss="handleDismissAddressDialog"
      @fill-address="handleFillAddress"
    />
    <div class="container">
      <ProfileHeader
        class="q-mb-md"
        :name="user?.name || user?.username || 'Artist'"
        sub-title="My Profile"
        @openPublicProfile="openPublicProfile"
      />
    </div>

    <div class="container">
      <TabsComp
        :tabs="TABS"
        :activeTab="activeTab"
        use-query
        send-initial-tab
        @setActiveTab="setActiveTab"
        class="full-width"
      />
    </div>

    <div class="container">
      <!-- Tab Content -->
      <AboutMeTab v-show="activeTab.tab === TAB_ABOUT" />
      <PortfolioTab v-show="activeTab.tab === TAB_PORTFOLIO" profile-type="artist" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import AboutMeTab from 'src/components/Profile/AboutMeTab.vue';
import { PortfolioTab } from 'src/components';
import { TabsComp } from 'src/components';
import { type ITab } from 'src/interfaces/tabs';
import ProfileHeader from 'src/components/Profile/ProfileHeader.vue';
import useUser from 'src/modules/useUser';
import { useRouter } from 'vue-router';
import AddressRequestDialog from 'src/components/Dialogs/AddressRequestDialog.vue';
import { hasUserAddress } from 'src/utils/address';

const { user, isArtist } = useUser();

const ADDRESS_DIALOG_STORAGE_KEY = 'guestspot-address-dialog-dismissed';

const TAB_ABOUT = 'about';
const TAB_PORTFOLIO = 'portfolio';

const TABS: ITab[] = [
  {
    label: 'About me',
    tab: TAB_ABOUT,
  },
  {
    label: 'Portfolio',
    tab: TAB_PORTFOLIO,
  },
];

const router = useRouter();

// Tab management
const activeTab = ref<ITab>(TABS[0]!);
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
  if (!isArtist.value || !user.value) {
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

const setActiveTab = (tab: ITab) => {
  activeTab.value = tab;
};

const openPublicProfile = () => {
  void router.push(`/artist/${user.value?.documentId}`);
};

const handleDismissAddressDialog = () => {
  const storageKey = addressDialogStorageKey.value;
  if (storageKey) {
    localStorage.setItem(storageKey, 'true');
  }
  showAddressDialog.value = false;
};

const handleFillAddress = () => {
  showAddressDialog.value = false;
  void router.push('/profile/location');
};
</script>
