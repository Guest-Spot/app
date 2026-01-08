<template>
  <q-page class="page q-pb-lg flex column items-start q-gap-md q-pb-5xl">
    <div class="container">
      <!-- Back Button -->
      <q-btn round flat @click="$router.back()" class="bg-block absolute-top-left q-z-2 back-btn">
        <q-icon name="chevron_left" size="24px" />
      </q-btn>

      <!-- Action Buttons -->
      <div class="action-buttons-header absolute-top-right q-z-2 flex q-gap-xs items-center">
        <!-- Shop Info Button -->
        <q-btn v-if="artistData.parent" round flat @click="openShopDialog" class="bg-block">
          <q-icon name="store" size="22px" color="primary" />
        </q-btn>

        <!-- Favorite Button -->
        <q-btn
          round
          flat
          :color="isFavorite ? 'red' : 'grey-6'"
          @click="toggleFavorite"
          class="bg-block"
        >
          <q-icon v-if="isFavorite" name="bookmark" size="22px" color="red" />
          <q-icon v-else name="bookmark_border" size="22px" color="red" />
        </q-btn>
      </div>
      <!-- Profile Header Section -->
      <div class="profile-header q-mb-md">
        <div
          class="profile-info-container flex column items-center q-gap-md full-width q-pb-md q-mt-xl"
        >
          <!-- Avatar -->
          <q-avatar size="150px" class="profile-avatar bg-block">
            <q-skeleton v-if="isLoadingArtist" width="150px" height="150px" square />
            <q-img
              v-else-if="artistData.avatar?.url"
              :src="artistData.avatar?.url"
              :ratio="1"
              spinner-color="dark"
              spinner-size="32px"
            />
            <q-icon v-else name="person" size="58px" color="grey-9" />
          </q-avatar>
          <div class="flex column items-center full-width">
            <template v-if="artistData.name">
              <div class="profile-name-row flex items-center q-gap-xs">
                <span class="full-name text-h6">{{ artistData.name }}</span>
                <VerifiedBadge v-if="artistData.verified" :verified="artistData.verified" />
              </div>
              <!-- Social Media Links -->
            </template>
            <template v-else>
              <q-skeleton type="text" width="50%" height="20px" />
              <q-skeleton type="text" width="70%" height="20px" />
            </template>
            <div v-if="artistLocation" class="profile-location flex items-center justify-center q-gap-sm text-caption text-grey-6">
              {{ artistLocation.split(', ').filter(Boolean).join(', ') }}
            </div>
            <div class="flex items-center justify-center q-gap-sm q-mt-sm">
              <SocialLinks v-if="links" :links="links" />
              <q-btn
                :round="!!links?.length"
                :rounded="!links?.length"
                flat
                size="sm"
                @click="openGoogleMaps"
                class="social-link-btn bg-block"
                color="primary"
              >
                <q-icon name="place" />
                <span v-if="!links?.length" class="text-caption q-ml-xs">Google Maps</span>
              </q-btn>
            </div>
          </div>
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
          <PublicAboutMeTab
            :artist-data="artistData"
            :can-claim="canClaim"
            @claim="onClaim"
          />
        </div>
        <div v-else-if="activeTab.tab === TAB_PORTFOLIO" class="tab-content">
          <PublicPortfolioTab :portfolio-items="portfolioItems" :loading="isLoadingPortfolio" />
        </div>
        <div v-else-if="activeTab.tab === TAB_TRIPS" class="tab-content">
          <PublicTripsTab :trips="trips" :loading="isLoadingTrips" />
        </div>
      </div>
    </div>

    <!-- Booking Button -->
    <div v-if="artistData.documentId" class="action-buttons full-width bg-block flex justify-center q-gap-sm">
      <div class="container">
        <q-btn
          rounded
          class="full-width q-py-sm q-mb-lg q-mt-md"
          color="primary"
          @click="goToBookingPage"
        >
          <div class="flex items-center justify-center q-gap-sm">
            <q-icon name="event" />
            <span class="text-h6">Book</span>
          </div>
        </q-btn>
      </div>
    </div>

    <!-- Shop Info Dialog -->
    <ShopInfoDialog v-model="showShopDialog" :shop-data="artistData.parent || null" />
    <ClaimProfileDialog
      v-model="showClaimDialog"
      :username="artistData.username || ''"
      :type="artistData.type || UserType.Artist"
      :user-id="artistData.documentId || ''"
      :email="artistData.email || ''"
      :name="artistData.name || ''"
      :phone="artistData.phone || ''"
      :link="artistData.link || ''"
      :document-id="artistData.documentId || ''"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PublicAboutMeTab, PublicPortfolioTab, PublicTripsTab } from 'src/components/ArtistProfile';
import { TabsComp, VerifiedBadge } from 'src/components';
import SocialLinks from 'src/components/PublicArtistProfile/SocialLinks.vue';
import { type ITab } from 'src/interfaces/tabs';
import type { ITrip } from 'src/interfaces/trip';
import type { IPortfolio } from 'src/interfaces/portfolio';
import { useFavorites } from 'src/modules/useFavorites';
import { ShopInfoDialog, ClaimProfileDialog } from 'src/components/Dialogs';
import type { IUser, IGraphQLUserResult } from 'src/interfaces/user';
import { USER_QUERY } from 'src/apollo/types/user';
import { useLazyQuery } from '@vue/apollo-composable';
import type { IGraphQLTripsResult } from 'src/interfaces/trip';
import { TRIPS_QUERY } from 'src/apollo/types/trip';
import { PORTFOLIOS_QUERY } from 'src/apollo/types/portfolio';
import type { IGraphQLPortfoliosResult } from 'src/interfaces/portfolio';
import { useArtistsStore } from 'src/stores/artists';
import useInviteCompos from 'src/composables/useInviteCompos';
import useNotify from 'src/modules/useNotify';
import { UserType } from 'src/interfaces/enums';
import { useUserStore } from 'src/stores/user';

const {
  load: loadArtist,
  onError: onErrorArtist,
  onResult: onResultArtist,
  loading: isLoadingArtist,
} = useLazyQuery<IGraphQLUserResult>(USER_QUERY);
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
const router = useRouter();
const artistsStore = useArtistsStore();
const { onInviteSuccess, onInviteError } = useInviteCompos();
const { showError, showSuccess } = useNotify();
const userStore = useUserStore();

const TAB_ABOUT = 'about';
const TAB_PORTFOLIO = 'portfolio';
const TAB_TRIPS = 'trips';

const artistData = ref<IUser>({
  documentId: '',
  createdAt: '',
  updatedAt: '',
  name: '',
  description: '',
  avatar: {
    url: '',
    id: '',
  },
  phone: '',
  email: '',
  link: '',
  city: '',
  address: '',
  experience: 0,
  openingHours: [],
  pictures: [],
  confirmed: false,
  blocked: false,
  type: UserType.Artist,
  id: '',
  device_tokens: [],
  verified: false,
});

// Portfolio data
const portfolioItems = ref<IPortfolio[]>([]);

// Trips data
const trips = ref<ITrip[]>([]);

// Computed properties for favorites
const links = computed(() => artistData.value?.profile?.links);
const artistLocation = computed(() => {
  const location = [artistData.value.country, artistData.value.state, artistData.value.city, artistData.value.address].filter(Boolean).join(', ');
  return location || null;
});
const isFavorite = computed(() => isArtistFavorite(artistData.value.documentId));
const isAuthenticated = computed(() => userStore.isAuthenticated);
const canClaim = computed(() => !!artistData.value.email && !artistData.value.confirmed && artistData.value.type !== UserType.Guest);
const showClaimDialog = ref(false);

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
    experience: artistData.value.experience || 0,
    avatar: artistData.value.avatar || {
      url: '',
      id: '',
    },
    phone: artistData.value.phone || '',
    email: artistData.value.email || '',
    link: artistData.value.link || '',
    city: artistData.value.city || '',
    address: artistData.value.address || '',
    openingHours: artistData.value.openingHours || [],
    pictures: artistData.value.pictures || [],
    confirmed: artistData.value.confirmed || false,
    blocked: artistData.value.blocked || false,
    type: artistData.value.type || UserType.Artist,
    id: artistData.value.id || '',
    device_tokens: artistData.value.device_tokens || [],
  });
};

const onClaim = () => {
  showClaimDialog.value = true;
};

// Dialog state
const showShopDialog = ref(false);

const openShopDialog = () => {
  showShopDialog.value = true;
};

const goToBookingPage = () => {
  if (!isAuthenticated.value) {
    return router.push({
      path: '/auth',
    });
  }
  if (!artistData.value.documentId) return;
  void router.push({ name: 'CreateBooking', query: { artistId: artistData.value.documentId } });
};

const openGoogleMaps = () => {
  const locationParts = [
    artistData.value.address,
    artistData.value.city,
    artistData.value.state,
    artistData.value.country,
  ].filter(Boolean);

  if (locationParts.length === 0) return;

  const query = locationParts.join(', ');
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  window.open(googleMapsUrl, '_blank');
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
      filters: {
        owner: {
          documentId: {
            eq: documentId,
          },
        },
      },
      sort: ['createdAt:desc'],
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
  if (result.data?.usersPermissionsUser) {
    artistData.value = result.data.usersPermissionsUser;
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

onInviteSuccess(() => {
  showSuccess(`Invitation sent to ${artistData.value?.name}!`);
});

onInviteError((error) => {
  console.error('Error sending invitation:', error);
  showError('Failed to send invitation. Please try again.');
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

.action-buttons-header {
  top: 16px;
  right: 16px;
}

.q-ios-padding {
  .back-btn {
    top: 70px;
  }

  .action-buttons-header {
    top: 70px;
  }
}

.profile-header {
  text-align: center;
}

.profile-avatar {
  overflow: hidden;
}

.profile-location {
  max-width: 200px;
}

.profile-name-row {
  justify-content: center;
  flex-wrap: wrap;
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

.action-buttons {
  position: fixed;
  bottom: 0;
  right: 0;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
}

.social-link-btn {
  color: var(--q-primary);
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    opacity: 0.8;
  }

  :deep(.q-icon) {
    color: var(--q-primary);
  }
}
</style>
