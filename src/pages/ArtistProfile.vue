<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <AddressRequestDialog
      v-model="showAddressDialog"
      @dismiss="handleDismissAddressDialog"
      description="Help clients find you easier by adding your address to your profile"
      @fill-address="handleFillAddress"
    />
    <AccountTypeUpgradeDialog
      v-model="showAccountTypeUpgradeDialog"
      :account-type="UserType.Artist"
      @dismiss="dismissUpgradeDialog"
    />
    <div class="container">
      <ProfileHeader
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
import { ref, watch } from 'vue';
import AboutMeTab from 'src/components/Profile/AboutMeTab.vue';
import { PortfolioTab } from 'src/components';
import { TabsComp } from 'src/components';
import { type ITab } from 'src/interfaces/tabs';
import ProfileHeader from 'src/components/Profile/ProfileHeader.vue';
import useUser from 'src/modules/useUser';
import { useRouter, useRoute } from 'vue-router';
import AddressRequestDialog from 'src/components/Dialogs/AddressRequestDialog.vue';
import { useAddressRequestDialog } from 'src/composables/useAddressRequestDialog';
import { useAccountTypeUpgradeDialog } from 'src/composables/useAccountTypeUpgradeDialog';
import AccountTypeUpgradeDialog from 'src/components/Dialogs/AccountTypeUpgradeDialog.vue';
import { UserType } from 'src/interfaces/enums';

const { user, isArtist } = useUser();

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
const route = useRoute();

// Tab management
const activeTab = ref<ITab>(TABS[0]!);
const setActiveTab = (tab: ITab) => {
  activeTab.value = tab;
};

const openPublicProfile = () => {
  void router.push(`/artist/${user.value?.documentId}`);
};

const {
  showAddressDialog,
  dismissAddressDialog: handleDismissAddressDialog,
  fillAddress: handleFillAddress,
} = useAddressRequestDialog({
  user,
  enabled: isArtist,
  onFillAddress: () => {
    void router.push('/profile/location');
  },
});

const {
  showUpgradeDialog: showAccountTypeUpgradeDialog,
  triggerUpgradeDialog,
  dismissUpgradeDialog,
} = useAccountTypeUpgradeDialog({
  user,
  enabled: isArtist,
  accountType: UserType.Artist,
});

const clearUpgradeQuery = () => {
  const { ...rest } = route.query;
  void router.replace({ query: { ...rest } });
};

const handleUpgradeQuery = (value: unknown) => {
  const normalizedValue = Array.isArray(value) ? value[0] : value;
  if (normalizedValue !== UserType.Artist) {
    return;
  }
  const handled = triggerUpgradeDialog();
  if (handled) {
    clearUpgradeQuery();
  }
};

watch(
  () => [route.query.accountTypeUpgraded, user.value?.id],
  ([value]) => handleUpgradeQuery(value),
  { immediate: true },
);
</script>
