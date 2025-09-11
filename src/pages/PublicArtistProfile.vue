<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="container">
      <!-- Back Button -->
      <q-btn round flat @click="$router.back()" class="bg-block absolute-top-left q-z-2 back-btn">
        <q-icon name="chevron_left" size="24px" />
      </q-btn>

      <!-- Favorite Button -->
      <q-btn
        round
        flat
        :color="isFavorite ? 'red' : 'grey-6'"
        @click="toggleFavorite"
        class="favorite-btn bg-block absolute-top-right q-z-2 favorite-btn"
      >
        <q-icon v-if="isFavorite" name="favorite" size="22px" color="red" />
        <q-icon v-else name="favorite_border" size="22px" color="red" />
      </q-btn>
      <!-- Profile Header Section -->
      <div class="profile-header q-mb-md">
        <div
          class="profile-info-container flex column items-center q-gap-md full-width q-pb-md q-mt-xl"
        >
          <!-- Avatar -->
          <q-avatar size="150px" class="profile-avatar bg-block">
            <q-img
              v-if="artistData.avatar?.url"
              :src="`${API_URL}${artistData.avatar?.url}`"
              :ratio="1"
              spinner-color="dark"
              spinner-size="32px"
            />
            <!-- <q-icon v-else name="person" size="60px" color="grey-6" /> -->
            <q-skeleton v-else width="150px" height="150px" square />
          </q-avatar>
          <div class="flex column items-center full-width">
            <template v-if="artistData.name || artistData.status">
              <span class="full-name text-h6">{{ artistData.name }}</span>
            </template>
            <template v-else>
              <q-skeleton type="text" width="50%" height="20px" />
              <q-skeleton type="text" width="70%" height="20px" />
            </template>
          </div>

          <!-- Booking Button -->
          <q-btn
            unelevated
            rounded
            class="bg-block"
            text-color="primary"
            @click="openBookingDialog"
          >
            <span class="text-body2">Booking request</span>
            <q-icon name="send" size="16px" color="primary" class="q-ml-sm" />
          </q-btn>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="full-width flex justify-center q-mb-lg">
        <TabsComp
          :tabs="TABS"
          :activeTab="activeTab"
          use-query
          send-initial-tab
          @setActiveTab="setActiveTab"
          :disable="!artistData.documentId"
        />
      </div>

      <!-- Main Content Area -->
      <div class="main-content flex column q-gap-md">
        <!-- Tab Content -->
        <div v-if="activeTab.tab === TAB_ABOUT" class="tab-content">
          <PublicAboutMeTab :artist-data="artistData" />
        </div>
        <div v-else-if="activeTab.tab === TAB_PORTFOLIO" class="tab-content">
          <PublicPortfolioTab :portfolio-items="portfolioItems" :loading="isLoadingPortfolio" />
        </div>
        <div v-else-if="activeTab.tab === TAB_TRIPS" class="tab-content">
          <PublicTripsTab :trips="trips" :loading="isLoadingTrips" />
        </div>
      </div>
    </div>

    <!-- Create Booking Dialog -->
    <CreateBookingDialog
      v-model="showBookingDialog"
      :shop-id="0"
      :artist-id="artistData.documentId"
      type="artist-to-shop"
      @submit="handleBookingSubmit"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import { PublicAboutMeTab, PublicPortfolioTab, PublicTripsTab } from 'src/components/ArtistProfile';
import { TabsComp } from 'src/components';
import { type ITab } from 'src/interfaces/tabs';
import type { IBooking } from 'src/interfaces/booking';
import type { ITrip } from 'src/interfaces/trip';
import type { IPortfolio } from 'src/interfaces/portfolio';
import { useFavorites } from 'src/modules/useFavorites';
import { CreateBookingDialog } from 'src/components/Dialogs';
import type { IArtist, IGraphQLArtistResult } from 'src/interfaces/artist';
import { ARTIST_QUERY } from 'src/apollo/types/artist';
import { useLazyQuery } from '@vue/apollo-composable';
import { API_URL } from 'src/config/constants';
import type { IGraphQLTripsResult } from 'src/interfaces/trip';
import { TRIPS_QUERY } from 'src/apollo/types/trip';
import { PORTFOLIOS_QUERY } from 'src/apollo/types/portfolio';
import type { IGraphQLPortfoliosResult } from 'src/interfaces/portfolio';
import { useArtistsStore } from 'src/stores/artists';

const {
  load: loadArtist,
  onError: onErrorArtist,
  onResult: onResultArtist,
} = useLazyQuery<IGraphQLArtistResult>(ARTIST_QUERY);
const {
  load: loadTrips,
  onError: onErrorTrips,
  onResult: onResultTrips,
  loading: isLoadingTrips,
} = useLazyQuery<IGraphQLTripsResult>(TRIPS_QUERY);
const {
  load: loadPortfolio,
  onError: onErrorPortfolio,
  onResult: onResultPortfolio,
  loading: isLoadingPortfolio,
} = useLazyQuery<IGraphQLPortfoliosResult>(PORTFOLIOS_QUERY);

const { isArtistFavorite, toggleArtistFavorite } = useFavorites();
const route = useRoute();
const artistsStore = useArtistsStore();

const TAB_ABOUT = 'about';
const TAB_PORTFOLIO = 'portfolio';
const TAB_TRIPS = 'trips';

// Artist data from Supabase
const artistData = ref<IArtist>({
  documentId: '',
  createdAt: '',
  updatedAt: '',
  name: '',
  status: '',
  description: '',
  avatar: {
    url: '',
  },
  phone: '',
  email: '',
  links: [],
  location: {
    city: '',
    address: '',
    latitude: '',
    longitude: '',
  },
});

// Portfolio data
const portfolioItems = ref<IPortfolio[]>([]);

// Trips data
const trips = ref<ITrip[]>([]);

// Computed properties for favorites
const isFavorite = computed(() => isArtistFavorite(artistData.value.documentId));

const TABS = computed<ITab[]>(() => [
  {
    label: 'About artist',
    tab: TAB_ABOUT,
  },
  {
    label: 'Portfolio',
    tab: TAB_PORTFOLIO,
    count: portfolioItems.value.length,
  },
  {
    label: 'Trips',
    tab: TAB_TRIPS,
    count: trips.value.length,
  },
]);

// Tab management
const activeTab = ref<ITab>(TABS.value[0]!);

const setActiveTab = (tab: ITab) => {
  activeTab.value = tab;
};

// Methods
const toggleFavorite = () => {
  toggleArtistFavorite({
    documentId: artistData.value.documentId,
    createdAt: artistData.value.createdAt,
    updatedAt: artistData.value.updatedAt,
    name: artistData.value.name,
    description: artistData.value.description,
    status: artistData.value.status || '',
    avatar: artistData.value.avatar || {
      url: '',
    },
    phone: artistData.value.phone || '',
    email: artistData.value.email || '',
    links: artistData.value.links || [],
    location: artistData.value.location || {
      city: '',
      address: '',
      latitude: '',
      longitude: '',
    },
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

// Function to load artist data
const loadArtistData = () => {
  const documentId = route.params.documentId as string;
  if (documentId) {
    const artistInStore = artistsStore.getArtists.find(
      (artist) => artist.documentId === documentId,
    );
    if (artistInStore) {
      artistData.value = artistInStore;
    } else {
      void loadArtist(null, { documentId });
    }
  }
};

// Function to load portfolio data
const loadPortfolioData = () => {
  const documentId = route.params.documentId as string;
  if (documentId) {
    void loadPortfolio(null, {
      ownerDocumentId: documentId,
    });
  }
};

// Function to load trips data
const loadTripsData = () => {
  const documentId = route.params.documentId as string;
  if (documentId) {
    void loadTrips(null, { documentId });
  }
};

onResultArtist((result) => {
  if (result.data?.artist) {
    artistData.value = result.data.artist;
  }
});

onErrorArtist((error) => {
  console.error('Error fetching artist:', error);
});

onResultTrips((result) => {
  if (result.data?.trips) {
    trips.value = result.data.trips;
  }
});

onErrorTrips((error) => {
  console.error('Error fetching trips:', error);
});

onResultPortfolio((result) => {
  if (result.data?.portfolios) {
    portfolioItems.value = result.data.portfolios;
  }
});

onErrorPortfolio((error) => {
  console.error('Error fetching portfolio:', error);
});

// Load all data on component mount
onBeforeMount(() => {
  void loadArtistData();
  void loadPortfolioData();
  void loadTripsData();
});
</script>

<style scoped lang="scss">
.back-btn {
  top: 16px;
  left: 16px;
}

.favorite-btn {
  top: 16px;
  right: 16px;
}

.q-ios-padding {
  .back-btn {
    top: 70px;
  }

  .favorite-btn {
    top: 70px;
  }
}

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
