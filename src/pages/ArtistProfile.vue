<template>
  <q-page class="q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="q-my-auto full-width">
      <div class="container">

        <div class="content full-width q-pa-md">
          <!-- Profile Header Section -->
          <div class="profile-header">
            <div class="profile-info-container flex column">
              <div class="profile-picture">
                <q-avatar size="120px" class="profile-avatar">
                  <q-icon name="person" size="80px" color="grey-6" />
                </q-avatar>
              </div>
              <div class="user-details full-width">
                <div class="detail-row">
                  <span class="detail-label">Username:</span>
                  <span class="detail-value">{{ artistData.username }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Fullname:</span>
                  <span class="detail-value">{{ artistData.fullname }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value">{{ artistData.status }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <TabsComp
          :tabs="TABS"
          :activeTab="activeTab"
          use-query
          @setActiveTab="setActiveTab"
          class="q-my-lg"
        />

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
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { AboutMeTab, PortfolioTab, TripsTab } from 'src/components/ArtistProfile';
import TabsComp from 'src/components/TabsComp.vue';
import { type ITab } from 'src/interfaces/tabs';

const TAB_ABOUT = 'about';
const TAB_PORTFOLIO = 'portfolio';
const TAB_TRIPS = 'trips';

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
  }
];

// Tab management
const activeTab = ref<ITab>(TABS[0]!);

const setActiveTab = (tab: ITab) => {
  activeTab.value = tab;
};

// Mock artist data
const artistData = ref({
  username: 'artist_john',
  fullname: 'John Doe',
  status: 'Available for bookings'
});
</script>

<style scoped lang="scss">
.content {
  width: 100%;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 30px;
  box-shadow: 0 10px 30px var(--shadow-light);
}

.profile-header {
  text-align: center;
}

.profile-info-container {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 20px;
  border: 1px solid var(--shadow-light);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
}

.profile-avatar {
  border: 1px solid var(--border-light);
}

.edit-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  transform: translate(50%, 50%);
}

.user-details {
  flex: 1;
  text-align: left;
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;

  &:last-child {
    margin-bottom: 0;
  }
}

.detail-label {
  font-weight: 600;
  color: var(--brand-dark);
}

.detail-value {
  width: 100%;
  color: var(--brand-dark);
  border-bottom: 1px dashed var(--shadow-light);
  padding-bottom: 2px;
  flex: 1;
}

.edit-profile-btn {
  margin-top: 10px;
}
</style>
