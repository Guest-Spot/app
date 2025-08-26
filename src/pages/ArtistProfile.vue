<template>
  <q-page class="q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <!-- Navigation Tabs -->
    <TabsComp
      :tabs="TABS"
      :activeTab="activeTab"
      use-query
      @setActiveTab="setActiveTab"
      class="q-mb-sm q-px-lg"
    />

    <div class="container">
      <!-- Main Content Area -->
      <div class="main-content flex column q-gap-md">
        <!-- Tab Content -->
        <div v-if="activeTab.tab === TAB_ABOUT" class="tab-content">
          <AboutMeTab />
        </div>
        <div v-else-if="activeTab.tab === TAB_PORTFOLIO" class="tab-content">
          <PortfolioTab />
        </div>
        <div v-else-if="activeTab.tab === TAB_TRIPS" class="tab-content">
          <TripsTab />
        </div>
        <div v-else-if="activeTab.tab === TAB_BOOKINGS" class="tab-content">
          <BookingsTab :artist-id="artistId" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { AboutMeTab, PortfolioTab, TripsTab, BookingsTab } from 'src/components/ArtistProfile';
import TabsComp from 'src/components/TabsComp.vue';
import { type ITab } from 'src/interfaces/tabs';

const TAB_ABOUT = 'about';
const TAB_PORTFOLIO = 'portfolio';
const TAB_TRIPS = 'trips';
const TAB_BOOKINGS = 'bookings';

const TABS: ITab[] = [
  {
    label: 'About me',
    tab: TAB_ABOUT
  },
  {
    label: 'Portfolio',
    tab: TAB_PORTFOLIO
  },
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

// Mock artist ID - in real app this would come from user store
const artistId = ref(1);

const setActiveTab = (tab: ITab) => {
  activeTab.value = tab;
};
</script>
