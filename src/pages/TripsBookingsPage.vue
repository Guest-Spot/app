<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-lg">
    <div class="container">
      <!-- Navigation Tabs -->
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
      <!-- Main Content Area -->
      <div class="main-content flex column q-gap-md">
        <!-- Tab Content -->
        <div v-if="activeTab.tab === TAB_TRIPS" class="tab-content">
          <TripsTab />
        </div>
        <div v-else-if="activeTab.tab === TAB_BOOKINGS" class="tab-content">
          <BookingsList :artist-id="artistId" :shop-id="shopId" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TripsTab from 'src/components/ArtistProfile/TripsTab.vue';
import BookingsList from 'src/components/Bookings/Artist/BookingsList.vue';
import { TabsComp } from 'src/components';
import { type ITab } from 'src/interfaces/tabs';

const TAB_TRIPS = 'trips';
const TAB_BOOKINGS = 'bookings';

const TABS: ITab[] = [
  {
    label: 'Trips',
    tab: TAB_TRIPS
  },
  {
    label: 'Bookings',
    tab: TAB_BOOKINGS
  }
];

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
