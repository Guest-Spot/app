<template>
  <Teleport to="body">
    <div
      v-show="isOpen"
      ref="overlayRef"
      class="profile-overlay bg-block"
      data-no-pull-refresh
      :style="overlayStyle"
      v-touch-pan.right.prevent.mouse="handleSwipePan"
    >
      <div class="page q-pb-lg flex column items-start q-gap-md">
        <div class="container">
          <!-- Close Button -->
          <q-btn round flat @click="closeOverlay" class="bg-block absolute-top-left q-z-2 back-btn">
            <q-icon name="chevron_left" size="24px" />
          </q-btn>

          <!-- Action Buttons -->
          <div class="action-buttons-header absolute-top-right q-z-2 flex q-gap-xs">
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
                </template>
                <template v-else>
                  <q-skeleton type="text" width="50%" height="20px" />
                  <q-skeleton type="text" width="70%" height="20px" />
                </template>
              </div>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div class="full-width flex justify-center q-mb-lg">
            <TabsComp
              :tabs="TABS"
              :activeTab="activeTab"
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
        <!-- Shop Info Dialog -->
        <ShopInfoDialog v-model="showShopDialog" :shop-data="artistData.parent || null" />
      </div>
      <!-- Booking Button -->
      <div
        v-if="artistData?.openingHours?.length"
        class="action-buttons full-width bg-block flex justify-center q-gap-sm"
      >
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
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { PublicAboutMeTab, PublicPortfolioTab, PublicTripsTab } from 'src/components/ArtistProfile';
import { TabsComp, VerifiedBadge } from 'src/components';
import { type ITab } from 'src/interfaces/tabs';
import type { ITrip } from 'src/interfaces/trip';
import type { IPortfolio } from 'src/interfaces/portfolio';
import { useFavorites } from 'src/modules/useFavorites';
import { ShopInfoDialog } from 'src/components/Dialogs';
import type { IUser, IGraphQLUserResult } from 'src/interfaces/user';
import { USER_QUERY } from 'src/apollo/types/user';
import { useLazyQuery } from '@vue/apollo-composable';
import type { IGraphQLTripsResult } from 'src/interfaces/trip';
import { TRIPS_QUERY } from 'src/apollo/types/trip';
import { PORTFOLIOS_QUERY } from 'src/apollo/types/portfolio';
import type { IGraphQLPortfoliosResult } from 'src/interfaces/portfolio';
import { useArtistsStore } from 'src/stores/artists';
import { UserType } from 'src/interfaces/enums';
import { useUserStore } from 'src/stores/user';
import { useProfileOverlay } from 'src/composables/useProfileOverlay';

interface Props {
  documentId: string | null;
  isOpen: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'close'): void }>();

const { closeProfile } = useProfileOverlay();

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
const router = useRouter();
const artistsStore = useArtistsStore();
const userStore = useUserStore();

// Swipe handling
const SWIPE_CLOSE_THRESHOLD = 120;
const MAX_OPACITY_DISTANCE = 340;
const OPACITY_START_DISTANCE = 150;
const MIN_SCALE = 0.7;

const overlayRef = ref<HTMLElement | null>(null);
const isSwiping = ref(false);
const swipeOffset = ref({ x: 0, y: 0 });

interface TouchPanPayload {
  evt?: Event;
  offset?: { x?: number; y?: number };
  isFirst?: boolean;
  isFinal?: boolean;
}

const overlayStyle = computed(() => {
  const offsetX = swipeOffset.value.x;
  const offsetY = swipeOffset.value.y;
  const progression =
    offsetX <= OPACITY_START_DISTANCE
      ? 0
      : Math.min(
          1,
          (offsetX - OPACITY_START_DISTANCE) /
            (MAX_OPACITY_DISTANCE - OPACITY_START_DISTANCE),
        );
  const opacity = 1 - progression * 0.95;
  const scale = 1 - progression * (1 - MIN_SCALE);

  return {
    transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
    transition: isSwiping.value ? 'none' : 'transform 0.2s ease',
    opacity: Math.max(0.05, opacity),
  };
});

const resetSwipeState = () => {
  isSwiping.value = false;
  swipeOffset.value = { x: 0, y: 0 };
};

const handleSwipePan = (payload: TouchPanPayload) => {
  if (!props.isOpen) {
    resetSwipeState();
    return false;
  }

  const targetElement =
    payload.evt?.target instanceof Element ? payload.evt.target : null;

  if (payload.isFirst) {
    if (targetElement?.closest('.image-carousel')) {
      resetSwipeState();
      return false;
    }

    isSwiping.value = true;
    swipeOffset.value = { x: 0, y: 0 };
  }

  if (payload.isFinal) {
    const finalOffset = Math.max(
      0,
      payload.offset?.x ?? swipeOffset.value.x,
    );
    const shouldClose = finalOffset > SWIPE_CLOSE_THRESHOLD;
    resetSwipeState();
    if (shouldClose) {
      closeOverlay();
    }
    return true;
  }

  swipeOffset.value = {
    x: Math.max(0, payload.offset?.x ?? 0),
    y: payload.offset?.y ?? swipeOffset.value.y,
  };
  return true;
};

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
const isFavorite = computed(() => isArtistFavorite(artistData.value.documentId));
const isAuthenticated = computed(() => userStore.isAuthenticated);

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

// Dialog state
const showShopDialog = ref(false);

const openShopDialog = () => {
  showShopDialog.value = true;
};

const closeOverlay = () => {
  resetSwipeState();
  closeProfile();
  emit('close');
};

const goToBookingPage = () => {
  if (!isAuthenticated.value) {
    closeOverlay();
    return router.push({
      path: '/auth',
    });
  }
  if (!artistData.value.documentId) return;
  closeOverlay();
  void router.push({ name: 'CreateBooking', query: { artistId: artistData.value.documentId } });
};

// Function to load artist data
const loadArtistData = (documentId: string) => {
  if (documentId) {
    const artistInStore = artistsStore.getArtists.find(
      (artist) => artist.documentId === documentId,
    );
    if (artistInStore) {
      artistData.value = artistInStore;
    }
    void loadArtist(null, { documentId }, { fetchPolicy: 'network-only' });
  }
};

// Function to load portfolio data
const loadPortfolioData = (documentId: string) => {
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
const loadTripsData = (documentId: string) => {
  if (documentId) {
    void loadTrips(null, { documentId });
  }
};

const resetData = () => {
  artistData.value = {
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
  };
  portfolioItems.value = [];
  trips.value = [];
  activeTab.value = TABS.value[0]!;
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

// Watch for documentId changes to load data
watch(
  () => props.documentId,
  (newDocumentId) => {
    if (newDocumentId && props.isOpen) {
      resetData();
      loadArtistData(newDocumentId);
      loadPortfolioData(newDocumentId);
      loadTripsData(newDocumentId);
    }
  },
  { immediate: true },
);

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen && props.documentId) {
      resetData();
      loadArtistData(props.documentId);
      loadPortfolioData(props.documentId);
      loadTripsData(props.documentId);
    }
    if (!isOpen) {
      resetSwipeState();
    }
  },
);

onBeforeUnmount(() => {
  resetSwipeState();
});
</script>

<style scoped lang="scss">
.profile-overlay {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  overflow-y: auto;
  padding-top: env(safe-area-inset-top);
  box-sizing: border-box;
  touch-action: pan-y;
  will-change: transform;
  z-index: 9999;
  background: var(--q-dark-page);
}

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
  position: sticky;
  bottom: 0;
  right: 0;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
}
</style>

