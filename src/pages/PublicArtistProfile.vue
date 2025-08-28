<template>
  <q-page class="q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="q-my-auto full-width">
      <div class="container">

        <!-- Profile Header Section -->
        <div class="profile-header q-mb-lg">
          <div class="profile-info-container flex column items-center q-gap-md full-width q-pb-md">
            <!-- Avatar -->
            <q-avatar size="150px" class="profile-avatar bg-block">
              <q-img
                v-if="artistData.avatar"
                :src="artistData.avatar"
                :ratio="1"
                spinner-color="dark"
                spinner-size="32px"
              />
              <q-icon v-else name="person" size="60px" color="grey-6" />
            </q-avatar>
            <div class="flex column items-center">
              <span class="full-name text-h6">{{ artistData.fullname }}</span>
              <span class="status text-body2">{{ artistData.status }}</span>
            </div>
  
            <!-- Booking Button -->
            <q-btn
              color="primary"
              text-color="white"
              unelevated
              rounded
              @click="openBookingDialog"
            >
              <span class="text-body2">Booking request</span>
              <q-icon name="send" size="16px" color="white" class="q-ml-sm" />
            </q-btn>

            <!-- Back Button -->
            <q-btn
              round
              flat
              dense
              icon="chevron_left"
              @click="$router.back()"
              class="bg-block absolute-top-left q-ma-md"
            />

            <!-- Favorite Button -->
            <q-btn
              round
              flat
              dense
              :color="isFavorite ? 'red' : 'grey-6'"
              @click="toggleFavorite"
              class="favorite-btn bg-block absolute-top-right q-ma-md"
            >
              <q-icon v-if="isFavorite" name="favorite" size="18px" color="red" />
              <q-icon v-else name="favorite_border" size="18px" color="red" />
            </q-btn>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="full-width flex justify-center q-mb-lg">
          <TabsComp
            :tabs="TABS"
            :activeTab="activeTab"
            use-query
            @setActiveTab="setActiveTab"
            size="sm"
          />
        </div>

        <!-- Main Content Area -->
        <div class="main-content flex column q-gap-md">
          <!-- Tab Content -->
          <div v-if="activeTab.tab === TAB_ABOUT" class="tab-content">
            <PublicAboutMeTab :artist-data="artistData" />
          </div>
          <div v-else-if="activeTab.tab === TAB_PORTFOLIO" class="tab-content">
            <PublicPortfolioTab :portfolio-items="portfolioItems" />
          </div>
          <div v-else-if="activeTab.tab === TAB_TRIPS" class="tab-content">
            <PublicTripsTab :trips="trips" />
          </div>
        </div>
      </div>
    </div>

    <!-- Create Booking Dialog -->
    <CreateBookingDialog
      v-model="showBookingDialog"
      :shop-id="0"
      :artist-id="artistData.id"
      type="artist-to-shop"
      @submit="handleBookingSubmit"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import PublicAboutMeTab from 'src/components/ArtistProfile/PublicAboutMeTab.vue';
import PublicPortfolioTab from 'src/components/ArtistProfile/PublicPortfolioTab.vue';
import PublicTripsTab from 'src/components/ArtistProfile/PublicTripsTab.vue';
import TabsComp from 'src/components/TabsComp.vue';
import { type ITab } from 'src/interfaces/tabs';
import type { IBooking } from 'src/interfaces/booking';
import { useFavorites } from 'src/modules/useFavorites';
import CreateBookingDialog from 'src/components/Dialogs/CreateBookingDialog.vue';

const { isArtistFavorite, toggleArtistFavorite } = useFavorites();

const TAB_ABOUT = 'about';
const TAB_PORTFOLIO = 'portfolio';
const TAB_TRIPS = 'trips';

const TABS: ITab[] = [
  {
    label: 'About artist',
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

// Mock artist data - в реальном приложении будет загружаться по ID
const artistData = ref({
  id: 1,
  username: 'artist_john',
  fullname: 'John Doe',
  status: 'Available for bookings',
  bio: 'Passionate artist with 5+ years of experience in live performances and studio recordings.',
  avatar: 'artists/artist1.jpeg',
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
    imageUrl: 'examples/example1.jpg',
    tags: ['Live', 'Orchestra', 'Performance']
  },
  {
    id: 2,
    title: 'Studio Recording Session',
    description: 'Professional studio recording for new album',
    imageUrl: 'examples/example2.jpeg',
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

// Computed properties for favorites
const isFavorite = computed(() => isArtistFavorite(artistData.value.id));

// Methods
const toggleFavorite = () => {
  toggleArtistFavorite({
    id: artistData.value.id,
    name: artistData.value.fullname,
    status: artistData.value.status,
    bio: artistData.value.bio,
    avatar: artistData.value.avatar
  });
};

// Dialog state
const showBookingDialog = ref(false);

const openBookingDialog = () => {
  showBookingDialog.value = true;
};

const handleBookingSubmit = (data: Partial<IBooking>) => {
  console.log('Booking submitted:', data);
  showBookingDialog.value = false;
};
</script>

<style scoped lang="scss">
.profile-header {
  text-align: center;
}

.profile-avatar {
  overflow: hidden;
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

.favorite-btn {
  min-width: 36px;
  min-height: 36px;
}
</style>
