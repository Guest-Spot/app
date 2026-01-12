<template>
  <q-page class="page q-pb-lg flex column items-start q-gap-md q-pb-5xl">
    <!-- Profile Header Section -->
    <div class="profile-header relative-position q-mx-auto full-width q-mb-md">
      <!-- Back Button -->
      <BackButton />

      <!-- Action Buttons -->
      <div class="action-buttons-header absolute-top-right q-z-2 flex q-gap-xs items-center">
        <!-- Favorite Button -->
        <q-btn
          round
          flat
          :color="isFavorite ? 'red' : 'grey-6'"
          @click="toggleFavorite"
          class="bg-block"
        >
          <q-icon v-if="isFavorite" name="bookmark" size="24px" color="red" />
          <q-icon v-else name="bookmark_border" size="24px" color="red" />
        </q-btn>

        <!-- Actions Menu -->
        <ProfileActionsMenu
          :document-id="shopData.documentId"
          :name="shopData.name"
          type="shop"
        />
      </div>

      <div class="profile-info-container flex column">
        <!-- Pictures Carousel or Avatar -->
        <div class="profile-carousel">
          <q-skeleton v-if="isLoadingShop" height="300px" square />
          <ImageCarousel
            v-else-if="shopPictures && shopPictures.length > 0"
            :pictures="shopPictures"
            height="300px"
          />
          <div v-else class="bg-block" style="height: 300px">
            <q-icon name="no_photography" size="48px" color="grey-9" class="absolute-center" />
          </div>
        </div>

        <!-- User Details -->
        <div class="container">
          <div class="user-details flex column items-center full-width q-pt-lg">
            <div class="flex column items-start full-width">
              <div
                v-if="shopData.name || shopData.description"
                class="flex column items-start q-gap-sm"
              >
                <div class="profile-name-row flex items-center q-gap-xs">
                  <span class="full-name text-h6">{{ shopData.name }}</span>
                  <VerifiedBadge v-if="shopData.verified" :verified="shopData.verified" />
                </div>
              </div>
              <template v-else>
                <q-skeleton type="text" width="50%" height="20px" />
                <q-skeleton type="text" width="100%" height="20px" />
                <q-skeleton type="text" width="100%" height="20px" />
              </template>
            </div>
            <div v-if="shopLocation" class="profile-location flex items-start justify-start q-gap-sm text-caption text-grey-6 full-width">
              {{ shopLocation.split(', ').filter(Boolean).join(', ') }}
            </div>
            <div class="flex items-center justify-start q-gap-sm q-mt-sm full-width">
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
    </div>

    <div class="container">
      <!-- Navigation Tabs -->
      <div class="full-width flex justify-center">
        <TabsComp
          :tabs="TABS"
          :activeTab="activeTab"
          send-initial-tab
          @setActiveTab="setActiveTab"
          :disable="!shopData.documentId"
          class="full-width"
        />
      </div>

      <!-- Main Content Area -->
      <div class="main-content flex column q-gap-md q-mt-lg">
        <!-- Tab Content -->
        <div v-if="activeTab.tab === TAB_ABOUT" class="tab-content">
          <PublicAboutShopTab
            :shop-data="shopData"
            :loading="isLoadingShop"
            :can-claim="canClaim"
            @claim="onClaim"
          />
        </div>
        <div v-else-if="activeTab.tab === TAB_ARTISTS" class="tab-content">
          <PublicShopArtistsTab :artists="artists" :loading="isLoadingShopArtists" />
        </div>
        <div v-else-if="activeTab.tab === TAB_PORTFOLIO" class="tab-content">
          <PublicShopPortfolioTab :portfolio-items="portfolioItems" :loading="isLoadingPortfolio" />
        </div>
      </div>
    </div>
    <!-- Booking Button -->
    <div v-if="artists?.length" class="action-buttons full-width bg-block flex justify-center q-gap-sm">
      <div class="container">
        <q-btn
          rounded
          class="full-width q-py-sm q-mb-lg q-mt-md"
          color="primary"
          :disable="!shopData.documentId"
          @click="goToBookingPage"
        >
          <div class="flex items-center justify-center q-gap-sm">
            <q-icon name="event" />
            <span class="text-h6">Book</span>
          </div>
        </q-btn>
      </div>
    </div>
    <ClaimProfileDialog
      v-model="showClaimDialog"
      :type="shopData.type || UserType.Shop"
      :user-id="shopData.documentId || ''"
      :username="shopData.username || ''"
      :email="shopData.email || ''"
      :name="shopData.name || ''"
      :phone="shopData.phone || ''"
      :link="shopData.link || ''"
      :document-id="shopData.documentId || ''"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { IGraphQLUserResult, IGraphQLUsersResult, IUser } from 'src/interfaces/user';
import type { IPortfolio, IGraphQLPortfoliosResult } from 'src/interfaces/portfolio';
import PublicAboutShopTab from 'src/components/PublicShopProfile/PublicAboutShopTab.vue';
import PublicShopArtistsTab from 'src/components/PublicShopProfile/PublicShopArtistsTab.vue';
import PublicShopPortfolioTab from 'src/components/PublicShopProfile/PublicShopPortfolioTab.vue';
import TabsComp from 'src/components/TabsComp.vue';
import { type ITab } from 'src/interfaces/tabs';
import { useFavorites } from 'src/modules/useFavorites';
import ImageCarousel from 'src/components/ImageCarousel.vue';
import { useLazyQuery } from '@vue/apollo-composable';
import { PORTFOLIOS_QUERY } from 'src/apollo/types/portfolio';
import { USER_QUERY, USERS_QUERY } from 'src/apollo/types/user';
import { useShopsStore } from 'src/stores/shops';
import { UserType } from 'src/interfaces/enums';
import { useUserStore } from 'src/stores/user';
import VerifiedBadge from 'src/components/VerifiedBadge.vue';
import { ClaimProfileDialog } from 'src/components/Dialogs';
import SocialLinks from 'src/components/PublicArtistProfile/SocialLinks.vue';
import ProfileActionsMenu from 'src/components/ProfileActionsMenu.vue';
import { BackButton } from 'src/components';

const { isShopFavorite, toggleShopFavorite } = useFavorites();
const route = useRoute();
const router = useRouter();
const shopsStore = useShopsStore();
const userStore = useUserStore();

// Apollo queries
const {
  load: loadShop,
  onError: onErrorShop,
  onResult: onResultShop,
  loading: isLoadingShop,
} = useLazyQuery<IGraphQLUserResult>(USER_QUERY);

const {
  load: loadShopArtists,
  onError: onErrorShopArtists,
  onResult: onResultShopArtists,
  loading: isLoadingShopArtists,
} = useLazyQuery<IGraphQLUsersResult>(USERS_QUERY);

const {
  load: loadPortfolio,
  onError: onErrorPortfolio,
  onResult: onResultPortfolio,
  loading: isLoadingPortfolio,
} = useLazyQuery<IGraphQLPortfoliosResult>(PORTFOLIOS_QUERY);

const TAB_ABOUT = 'about';
const TAB_ARTISTS = 'artists';
const TAB_PORTFOLIO = 'portfolio';

const shopData = ref<IUser>({
  documentId: '',
  createdAt: '',
  updatedAt: '',
  city: '',
  country: '',
  state: '',
  address: '',
  link: '',
  description: '',
  name: '',
  phone: '',
  email: '',
  openingHours: [],
  pictures: [],
  avatar: {
    url: '',
    id: '',
  },
  confirmed: false,
  blocked: false,
  type: UserType.Shop,
  id: '',
  device_tokens: [],
  verified: false,
});

// Artists data
const artists = ref<IUser[]>([]);

// Portfolio data
const portfolioItems = ref<IPortfolio[]>([]);

// Computed properties for favorites
const isFavorite = computed(() => isShopFavorite(shopData.value.documentId));
const shopPictures = computed(() => shopData.value?.pictures?.map((picture) => picture.url));
const isAuthenticated = computed(() => userStore.isAuthenticated);
const canClaim = computed(() => !!shopData.value.email && !shopData.value.confirmed && shopData.value.type !== UserType.Guest);
const showClaimDialog = ref(false);
const links = computed(() => shopData.value?.profile?.links);
const shopLocation = computed(() => {
  const location = [shopData.value.country, shopData.value.state, shopData.value.city, shopData.value.address].filter(Boolean).join(', ');
  return location || null;
});

const TABS = computed<ITab[]>(() => [
  {
    label: 'About shop',
    tab: TAB_ABOUT,
  },
  {
    label: 'Portfolio',
    tab: TAB_PORTFOLIO,
    count: portfolioItems.value.length,
  },
  {
    label: 'Artists',
    tab: TAB_ARTISTS,
    count: artists.value.length,
  },
]);

const activeTab = ref<ITab>(TABS.value[0]!);

// Methods
const toggleFavorite = () => {
  toggleShopFavorite(shopData.value);
};

const onClaim = () => {
  showClaimDialog.value = true;
};

const setActiveTab = (tab: ITab) => {
  activeTab.value = tab;
};

// Booking dialog state
const goToBookingPage = () => {
  if (!isAuthenticated.value) {
    return router.push({
      path: '/auth',
    });
  }
  if (!shopData.value.documentId) return;
  void router.push({
    name: 'CreateBooking',
    query: {
      shopId: shopData.value.documentId,
    },
  });
};

const openGoogleMaps = () => {
  const locationParts = [
    shopData.value.address,
    shopData.value.city,
    shopData.value.state,
    shopData.value.country,
  ].filter(Boolean);

  if (locationParts.length === 0) return;

  const query = locationParts.join(', ');
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  window.open(googleMapsUrl, '_blank');
};

// Fetch shop data from store or via Apollo
const loadShopData = () => {
  const documentId = route.params.documentId as string;
  if (documentId) {
    const shopInStore = shopsStore.getShops.find((shop) => shop.documentId === documentId);
    if (shopInStore) {
      shopData.value = shopInStore;
    }
    void loadShop(null, { documentId }, { fetchPolicy: 'network-only' });
  }
};

// Handle shop query result
onResultShop((result) => {
  if (result.data?.usersPermissionsUser) {
    shopData.value = result.data.usersPermissionsUser;
  }
});

onErrorShop((error) => {
  console.error('Error fetching shop:', error);
});

// Handle shop artists query result
onResultShopArtists((result) => {
  if (result.data?.usersPermissionsUsers) {
    artists.value = result.data.usersPermissionsUsers;
  }
});

onErrorShopArtists((error) => {
  console.error('Error fetching shop artists:', error);
});

onResultPortfolio((result) => {
  if (result.data?.portfolios) {
    portfolioItems.value = result.data.portfolios;
  }
});

onErrorPortfolio((error) => {
  console.error('Error fetching portfolio:', error);
});

onBeforeMount(() => {
  void loadShopData();
  void loadPortfolio(null, {
    filters: {
      owner: {
        documentId: {
          eq: route.params.documentId as string,
        },
      },
    },
    sort: ['createdAt:desc'],
  });
  void loadShopArtists(
    null,
    {
      filters: {
        parent: {
          documentId: {
            eq: route.params.documentId as string,
          },
        },
      },
    },
    { fetchPolicy: 'network-only' },
  );
});
</script>

<style scoped lang="scss">
.action-buttons-header {
  top: 16px;
  right: 16px;
}

.q-ios-padding {
  .page {
    padding-top: 0;
    border-radius: 50px 50px 0 0;
    overflow: hidden;
  }

  .action-buttons-header {
    top: 70px;
  }
}

.profile-header {
  text-align: center;
}

.profile-info-container {
  width: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.profile-name-row {
  flex-wrap: wrap;
  gap: 4px;
}

.profile-carousel {
  width: 100%;
  overflow: hidden;
  z-index: 1;
}

.detail-row {
  display: flex;
  flex-direction: column;
  align-items: start;
  margin-bottom: 15px;
  gap: 10px;

  &:last-child {
    margin-bottom: 0;
  }
}

.detail-label {
  font-weight: 600;
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
