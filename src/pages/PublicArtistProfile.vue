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
                  <q-img
                    v-if="artistData.avatar"
                    :src="artistData.avatar"
                    :ratio="1"
                    spinner-color="dark"
                    spinner-size="32px"
                  />
                  <q-icon v-else name="person" size="80px" color="grey-6" />
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
                <div class="detail-row" v-if="artistData.bio">
                  <span class="detail-label">Bio:</span>
                  <span class="detail-value">{{ artistData.bio }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="tabs-section q-my-lg">
          <div class="tab-container">
            <q-btn
              class="tab-btn"
              :class="{ active: activeTab === TAB_ABOUT }"
              unelevated
              rounded
              :outline="activeTab !== TAB_ABOUT"
              :color="activeTab === TAB_ABOUT ? 'dark' : 'grey-7'"
              :text-color="activeTab === TAB_ABOUT ? 'white' : 'dark'"
              label="About me"
              @click="setActiveTab(TAB_ABOUT)"
            />
            <q-btn
              class="tab-btn"
              :class="{ active: activeTab === TAB_PORTFOLIO }"
              unelevated
              rounded
              :outline="activeTab !== TAB_PORTFOLIO"
              :color="activeTab === TAB_PORTFOLIO ? 'dark' : 'grey-7'"
              :text-color="activeTab === TAB_PORTFOLIO ? 'white' : 'dark'"
              label="Portfolio"
              @click="setActiveTab(TAB_PORTFOLIO)"
            />
            <q-btn
              class="tab-btn"
              :class="{ active: activeTab === TAB_TRIPS }"
              unelevated
              rounded
              :outline="activeTab !== TAB_TRIPS"
              :color="activeTab === TAB_TRIPS ? 'dark' : 'grey-7'"
              :text-color="activeTab === TAB_TRIPS ? 'white' : 'dark'"
              label="Trips"
              @click="setActiveTab(TAB_TRIPS)"
            />
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="main-content flex column q-gap-md">
          <!-- Tab Content -->
          <div v-if="activeTab === TAB_ABOUT" class="tab-content">
            <PublicAboutMeTab :artist-data="artistData" />
          </div>
          <div v-else-if="activeTab === TAB_PORTFOLIO" class="tab-content">
            <PublicPortfolioTab :portfolio-items="portfolioItems" />
          </div>
          <div v-else-if="activeTab === TAB_TRIPS" class="tab-content">
            <PublicTripsTab :trips="trips" />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import PublicAboutMeTab from 'src/components/ArtistProfile/PublicAboutMeTab.vue';
import PublicPortfolioTab from 'src/components/ArtistProfile/PublicPortfolioTab.vue';
import PublicTripsTab from 'src/components/ArtistProfile/PublicTripsTab.vue';

const route = useRoute();

const TAB_ABOUT = 'about';
const TAB_PORTFOLIO = 'portfolio';
const TAB_TRIPS = 'trips';

// Tab management
const activeTab = ref(TAB_ABOUT);

const setActiveTab = (tab: string) => {
  activeTab.value = tab;
};

// Mock artist data - в реальном приложении будет загружаться по ID
const artistData = ref({
  id: 1,
  username: 'artist_john',
  fullname: 'John Doe',
  status: 'Available for bookings',
  bio: 'Passionate artist with 5+ years of experience in live performances and studio recordings.',
  avatar: null,
  phone: '+1 (555) 123-4567',
  email: 'john.doe@example.com',
  instagram: 'https://instagram.com/johndoe_artist',
  facebook: 'https://facebook.com/johndoe.artist',
});

// Mock portfolio data
const portfolioItems = ref([
  {
    id: 1,
    title: 'Live Performance at Central Park',
    description: 'Amazing live performance with full orchestra',
    imageUrl: 'https://picsum.photos/300/300?random=1',
    tags: ['Live', 'Orchestra', 'Performance']
  },
  {
    id: 2,
    title: 'Studio Recording Session',
    description: 'Professional studio recording for new album',
    imageUrl: 'https://picsum.photos/300/300?random=2',
    tags: ['Studio', 'Recording', 'Album']
  }
]);

// Mock trips data
const trips = ref([
  {
    id: 1,
    title: 'European Tour 2024',
    description: 'Multi-city tour across Europe',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    status: 'Upcoming'
  },
  {
    id: 2,
    title: 'Asia Festival',
    description: 'Music festival in Tokyo and Seoul',
    startDate: '2024-09-15',
    endDate: '2024-09-30',
    status: 'Planning'
  }
]);

onMounted(() => {
  const artistId = route.params.id;
  console.log('Loading artist profile for ID:', artistId);
  // Здесь будет загрузка данных артиста по ID
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
  min-width: 80px;
}

.detail-value {
  width: 100%;
  color: var(--brand-dark);
  border-bottom: 1px dashed var(--shadow-light);
  padding-bottom: 2px;
  flex: 1;
}

.tabs-section {
  display: flex;
  justify-content: center;
}

.tab-container {
  display: flex;
  gap: 10px;
}

.tab-btn {
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  
  &.active {
    transform: scale(1.05);
  }
}
</style>
