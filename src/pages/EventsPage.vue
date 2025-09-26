<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-lg">
    <template v-if="isAuthenticated">
      <!-- Navigation Tabs -->
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

      <!-- Main Content Area -->
      <div class="container">
        <div class="main-content flex column q-gap-md">
          <div v-if="activeTab.tab === TAB_INVITES" class="tab-content">
            <InvitesTab />
          </div>
          <div v-else-if="activeTab.tab === TAB_TRIPS" class="tab-content">
            <TripsTab />
          </div>
          <div v-else-if="activeTab.tab === TAB_BOOKINGS" class="tab-content">
            <BookingsList :artist-id="artistId" :shop-id="shopId" />
          </div>
        </div>
      </div>
    </template>
    <SingInToContinue v-else class="fixed-center full-width" title="My Trips & Bookings" />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TripsTab from 'src/components/ArtistProfile/TripsTab.vue';
import BookingsList from 'src/components/Bookings/Artist/BookingsList.vue';
import { TabsComp } from 'src/components';
import { type ITab } from 'src/interfaces/tabs';
import SingInToContinue from 'src/components/SingInToContinue.vue';
import useUser from 'src/modules/useUser';
import InvitesTab from 'src/components/Events/InvitesTab/index.vue';

const TAB_INVITES = 'invites';
const TAB_TRIPS = 'trips';
const TAB_BOOKINGS = 'bookings';

const TABS: ITab[] = [
  {
    label: 'Invites',
    tab: TAB_INVITES,
  },
  {
    label: 'Trips',
    tab: TAB_TRIPS,
  },
  {
    label: 'Bookings',
    tab: TAB_BOOKINGS,
  },
];

const { isAuthenticated } = useUser();

// Tab management
const activeTab = ref<ITab>(TABS[0]!);

// Mock IDs - in real app these would come from user store
const artistId = ref(1);
const shopId = ref(1);

const setActiveTab = (tab: ITab) => {
  activeTab.value = tab;
};
</script>

<style scoped lang="scss">
.tab-content {
  min-height: 400px;
}
</style>
