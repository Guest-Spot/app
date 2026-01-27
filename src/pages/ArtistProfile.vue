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
      <ArtistGuestSpotBookings
        v-show="activeTab.tab === TAB_GUEST_SPOT_BOOKINGS"
        :bookings="guestSpotBookings"
        :loading="isLoadingGuestSpotBookings"
        @view-booking="handleViewGuestSpotBooking"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import AboutMeTab from 'src/components/Profile/AboutMeTab.vue';
import { PortfolioTab, ArtistGuestSpotBookings } from 'src/components';
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
import useGuestSpot from 'src/composables/useGuestSpot';

const { user, isArtist } = useUser();
const { bookings: guestSpotBookings, isLoadingBookings: isLoadingGuestSpotBookings, loadBookings: loadGuestSpotBookings } = useGuestSpot();

const TAB_ABOUT = 'about';
const TAB_PORTFOLIO = 'portfolio';
const TAB_GUEST_SPOT_BOOKINGS = 'guest-spot-bookings';

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
    label: 'Guest Spot Bookings',
    tab: TAB_GUEST_SPOT_BOOKINGS,
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

onMounted(async () => {
  if (user.value?.documentId && isArtist.value) {
    await loadGuestSpotBookings({ artistDocumentId: user.value.documentId });
  }
});

const handleViewGuestSpotBooking = (booking: unknown) => {
  // Navigate to booking details or show dialog
  console.log('View guest spot booking:', booking);
};
</script>
