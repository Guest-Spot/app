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
      :account-type="UserType.Shop"
      @dismiss="dismissUpgradeDialog"
    />
    <div class="container">
      <ProfileHeader
        :name="user?.name || user?.username || 'Shop'"
        sub-title="My Profile"
        @openPublicProfile="openPublicProfile"
      />
    </div>

    <div class="container">
      <GuestSpotBanner class="q-mb-md" />
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
      <ShopArtistsTab v-show="activeTab.tab === TAB_ARTISTS" />
      <PortfolioTab v-show="activeTab.tab === TAB_PORTFOLIO" profile-type="shop" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { type ITab } from 'src/interfaces/tabs';
import AboutMeTab from 'src/components/Profile/AboutMeTab.vue';
import { ShopArtistsTab } from 'src/components/ShopProfile';
import GuestSpotBanner from 'src/components/ShopProfile/GuestSpotBanner.vue';
import { TabsComp, PortfolioTab } from 'src/components';
import ProfileHeader from 'src/components/Profile/ProfileHeader.vue';
import { useRouter, useRoute } from 'vue-router';
import useUser from 'src/modules/useUser';
import AddressRequestDialog from 'src/components/Dialogs/AddressRequestDialog.vue';
import { useAddressRequestDialog } from 'src/composables/useAddressRequestDialog';
import AccountTypeUpgradeDialog from 'src/components/Dialogs/AccountTypeUpgradeDialog.vue';
import { useAccountTypeUpgradeDialog } from 'src/composables/useAccountTypeUpgradeDialog';
import { UserType } from 'src/interfaces/enums';

const { user, isShop } = useUser();

const TAB_ABOUT = 'about';
const TAB_ARTISTS = 'artists';
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
  {
    label: 'Shop Artists',
    tab: TAB_ARTISTS,
  },
];

// Tab management
const activeTab = ref<ITab>(TABS[0]!);
const router = useRouter();
const route = useRoute();

const setActiveTab = (tab: ITab) => {
  activeTab.value = tab;
};

const openPublicProfile = () => {
  void router.push(`/shop/${user.value?.documentId}`);
};

const {
  showAddressDialog,
  dismissAddressDialog: handleDismissAddressDialog,
  fillAddress: handleFillAddress,
} = useAddressRequestDialog({
  user,
  enabled: isShop,
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
  enabled: isShop,
  accountType: UserType.Shop,
});

const clearUpgradeQuery = () => {
  const { ...rest } = route.query;
  void router.replace({ query: { ...rest } });
};

const handleUpgradeQuery = (value: unknown) => {
  const normalizedValue = Array.isArray(value) ? value[0] : value;
  if (normalizedValue !== UserType.Shop) {
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
