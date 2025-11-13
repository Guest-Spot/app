<template>
  <q-page class="page q-pb-lg flex column items-start q-gap-md" :class="{ 'q-pb-4xl': isGuest }">
    <!-- Profile Header Section -->
    <div class="profile-header relative-position q-mx-auto full-width q-mb-md">
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
        <q-icon v-if="isFavorite" name="bookmark" size="24px" color="red" />
        <q-icon v-else name="bookmark_border" size="24px" color="red" />
      </q-btn>

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
          <div class="user-details flex column items-center q-gap-lg full-width q-pt-lg">
            <div class="flex column items-start full-width">
              <div
                v-if="shopData.name || shopData.description"
                class="flex column items-start q-gap-sm"
              >
                <div class="profile-name-row flex items-center q-gap-xs">
                  <span class="full-name text-h6">{{ shopData.name }}</span>
                  <VerifiedBadge v-if="shopData.verified" :verified="shopData.verified" />
                </div>
                <ExpandableText
                  collapsible
                  :text="shopData.description"
                  class="status text-body2 text-left text-grey-6"
                />
              </div>
              <template v-else>
                <q-skeleton type="text" width="50%" height="20px" />
                <q-skeleton type="text" width="100%" height="20px" />
                <q-skeleton type="text" width="100%" height="20px" />
              </template>
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
        />
      </div>

      <!-- Main Content Area -->
      <div class="main-content flex column q-gap-md q-mt-lg">
        <!-- Tab Content -->
        <div v-if="activeTab.tab === TAB_ABOUT" class="tab-content">
          <PublicAboutShopTab :shop-data="shopData" :loading="isLoadingShop" />
        </div>
        <div v-else-if="activeTab.tab === TAB_ARTISTS" class="tab-content">
          <PublicShopArtistsTab :artists="artists" :loading="isLoadingShopArtists" />
        </div>
        <div v-else-if="activeTab.tab === TAB_PORTFOLIO" class="tab-content">
          <PublicShopPortfolioTab :portfolio-items="portfolioItems" :loading="isLoadingPortfolio" />
        </div>
      </div>

      <!-- Action Buttons -->
      <div v-if="isGuest" class="action-buttons flex justify-center q-gap-sm no-wrap q-mt-lg">
        <q-btn
          class="bg-block"
          text-color="primary"
          round
          size="lg"
          :disable="!shopData.documentId"
          @click="goToBookingPage"
        >
          <q-icon name="event" color="primary" />
        </q-btn>
      </div>
    </div>
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
import ExpandableText from 'src/components/ExpandableText.vue';
import { UserType } from 'src/interfaces/enums';
import { useUserStore } from 'src/stores/user';
import VerifiedBadge from 'src/components/VerifiedBadge.vue';

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
const isGuest = computed(() => userStore.getIsGuest);

const TABS = computed<ITab[]>(() => [
  {
    label: 'About shop',
    tab: TAB_ABOUT,
  },
  {
    label: 'Artists',
    tab: TAB_ARTISTS,
    count: artists.value.length,
  },
  {
    label: 'Portfolio',
    tab: TAB_PORTFOLIO,
    count: portfolioItems.value.length,
  },
]);

const activeTab = ref<ITab>(TABS.value[0]!);

// Methods
const toggleFavorite = () => {
  toggleShopFavorite(shopData.value);
};

const setActiveTab = (tab: ITab) => {
  activeTab.value = tab;
};

// Booking dialog state
const goToBookingPage = () => {
  if (!shopData.value.documentId) return;
  void router.push({
    name: 'CreateBooking',
    query: {
      shopId: shopData.value.documentId,
    },
  });
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
.back-btn {
  top: 16px;
  left: 16px;
}

.favorite-btn {
  top: 16px;
  right: 16px;
}

.q-ios-padding {
  .page {
    padding-top: 0;
    border-radius: 50px 50px 0 0;
    overflow: hidden;
  }

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
  right: 16px;
  bottom: 98px;
}
</style>
