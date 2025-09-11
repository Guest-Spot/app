<template>
  <q-page class="page q-pb-xl flex column items-start q-gap-md">
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
        <q-icon v-if="isFavorite" name="favorite" size="24px" color="red" />
        <q-icon v-else name="favorite_border" size="24px" color="red" />
      </q-btn>

      <div class="profile-info-container flex column">
        <!-- Pictures Carousel or Avatar -->
        <div class="profile-carousel">
          <ImageCarousel
            v-if="shopPictures && shopPictures.length > 0"
            :pictures="shopPictures"
            height="300px"
          />
          <q-skeleton v-else height="300px" square />
        </div>

        <!-- User Details -->
        <div class="container">
          <div class="user-details flex column items-center q-gap-lg full-width q-pt-lg">
            <div class="flex column items-center full-width">
              <template v-if="shopData.name || shopData.description">
                <span class="full-name text-h6">{{ shopData.name }}</span>
                <span class="status text-body2 text-center text-grey-6">{{
                  shopData.description
                }}</span>
              </template>
              <template v-else>
                <q-skeleton type="text" width="50%" height="20px" />
                <q-skeleton type="text" width="100%" height="20px" />
                <q-skeleton type="text" width="100%" height="20px" />
              </template>
            </div>
            <div class="flex justify-center q-gap-sm full-width no-wrap">
              <q-btn
                class="bg-block"
                text-color="primary"
                unelevated
                rounded
                :disable="!shopData.documentId"
                @click="openBookingDialog"
              >
                <span class="text-body2">Booking request</span>
                <q-icon name="send" size="16px" color="primary" class="q-ml-sm" />
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
    </div>

    <!-- Create Booking Dialog -->
    <CreateBookingDialog
      v-model="showBookingDialog"
      :shop-documentId="shopData.documentId"
      type="shop-to-artist"
      @submit="handleBookingSubmit"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import type { IBooking } from 'src/interfaces/booking';
import type { IShop, IGraphQLShopResult, IGraphQLShopArtistsResult } from 'src/interfaces/shop';
import type { IArtist } from 'src/interfaces/artist';
import type { IPortfolio, IGraphQLPortfoliosResult } from 'src/interfaces/portfolio';
import PublicAboutShopTab from 'src/components/PublicShopProfile/PublicAboutShopTab.vue';
import PublicShopArtistsTab from 'src/components/PublicShopProfile/PublicShopArtistsTab.vue';
import PublicShopPortfolioTab from 'src/components/PublicShopProfile/PublicShopPortfolioTab.vue';
import TabsComp from 'src/components/TabsComp.vue';
import { type ITab } from 'src/interfaces/tabs';
import { useFavorites } from 'src/modules/useFavorites';
import CreateBookingDialog from 'src/components/Dialogs/CreateBookingDialog.vue';
import ImageCarousel from 'src/components/ImageCarousel.vue';
import { useLazyQuery } from '@vue/apollo-composable';
import { PORTFOLIOS_QUERY } from 'src/apollo/types/portfolio';
import { SHOP_QUERY, SHOP_ARTISTS_QUERY } from 'src/apollo/types/shop';
import { useShopsStore } from 'src/stores/shops';

const { isShopFavorite, toggleShopFavorite } = useFavorites();
const route = useRoute();
const shopsStore = useShopsStore();

// Apollo queries
const {
  load: loadShop,
  onError: onErrorShop,
  onResult: onResultShop,
  loading: isLoadingShop,
} = useLazyQuery<IGraphQLShopResult>(SHOP_QUERY);

const {
  load: loadShopArtists,
  onError: onErrorShopArtists,
  onResult: onResultShopArtists,
  loading: isLoadingShopArtists,
} = useLazyQuery<IGraphQLShopArtistsResult>(SHOP_ARTISTS_QUERY);

const {
  load: loadPortfolio,
  onError: onErrorPortfolio,
  onResult: onResultPortfolio,
  loading: isLoadingPortfolio,
} = useLazyQuery<IGraphQLPortfoliosResult>(PORTFOLIOS_QUERY);

const TAB_ABOUT = 'about';
const TAB_ARTISTS = 'artists';
const TAB_PORTFOLIO = 'portfolio';

// Shop data from Supabase
const shopData = ref<IShop>({
  documentId: '',
  createdAt: '',
  updatedAt: '',
  location: {
    city: '',
    address: '',
    latitude: '',
    longitude: '',
  },
  description: '',
  name: '',
  phone: '',
  email: '',
  openingHours: [],
  links: [],
  pictures: [],
});

// Artists data
const artists = ref<IArtist[]>([]);

// Portfolio data
const portfolioItems = ref<IPortfolio[]>([]);

// Computed properties for favorites
const isFavorite = computed(() => isShopFavorite(shopData.value.documentId));
const shopPictures = computed(() => shopData.value?.pictures?.map((picture) => picture.url));

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

const showBookingDialog = ref(false);
const activeTab = ref<ITab>(TABS.value[0]!);

// Methods
const toggleFavorite = () => {
  toggleShopFavorite(shopData.value);
};

const setActiveTab = (tab: ITab) => {
  activeTab.value = tab;
};

// Booking dialog state
const openBookingDialog = () => {
  showBookingDialog.value = true;
};

const handleBookingSubmit = (bookingData: Partial<IBooking>) => {
  console.log('Booking submitted:', bookingData);
  showBookingDialog.value = false;
};

// Fetch shop data from store or via Apollo
const loadShopData = () => {
  const documentId = route.params.documentId as string;
  if (documentId) {
    const shopInStore = shopsStore.getShops.find((shop) => shop.documentId === documentId);
    if (shopInStore) {
      shopData.value = shopInStore;
    } else {
      void loadShop(null, { documentId });
    }
  }
};

// Handle shop query result
onResultShop((result) => {
  if (result.data?.shop) {
    shopData.value = result.data.shop;
  }
});

onErrorShop((error) => {
  console.error('Error fetching shop:', error);
});

// Handle shop artists query result
onResultShopArtists((result) => {
  if (result.data?.shopArtists) {
    artists.value = result.data.shopArtists;
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
  setTimeout(() => {
    void loadShopData();
  }, 1000);
  void loadPortfolio(null, { documentId: route.params.documentId as string });
  void loadShopArtists(null, { documentId: route.params.documentId as string });
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
</style>
