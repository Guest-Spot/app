<template>
  <q-page class="page q-pb-xl flex column items-start q-gap-md">
    <!-- Profile Header Section -->
    <div class="profile-header q-mb-md relative-position q-mx-auto full-width">
      <div class="profile-info-container flex column">

        <!-- Pictures Carousel or Avatar -->
        <div class="profile-carousel">
          <ImageCarousel
            v-if="shopData.pictures && shopData.pictures.length > 0"
            :pictures="shopData.pictures"
            height="200px"
          />
          <q-skeleton v-else height="200px" square />
        </div>

        <!-- Back Button -->
        <q-btn
          round
          flat
          dense
          icon="chevron_left"
          @click="$router.back()"
          class="bg-block absolute-top-left q-ma-md q-z-2"
        >
        </q-btn>

        <!-- Favorite Button -->
        <q-btn
          round
          flat
          dense
          :color="isFavorite ? 'red' : 'grey-6'"
          @click="toggleFavorite"
          class="favorite-btn bg-block absolute-top-right q-ma-md q-z-2"
        >
          <q-icon v-if="isFavorite" name="favorite" size="18px" color="red" />
          <q-icon v-else name="favorite_border" size="18px" color="red" />
        </q-btn>

        <!-- User Details -->
        <div class="container">
          <div class="user-details flex column items-center q-gap-lg full-width q-pt-lg">
            <div class="flex column items-center full-width">
              <template v-if="shopData.title || shopData.description">
                <span class="full-name text-h6">{{ shopData.title }}</span>
                <span class="status text-body2 text-center text-grey-6">{{ shopData.description }}</span>
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
                :disable="!shopData.uuid"
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
           use-query
           send-initial-tab
           @setActiveTab="setActiveTab"
           size="sm"
           :disable="!shopData.uuid"
         />
       </div>

      <!-- Main Content Area -->
      <div class="main-content flex column q-gap-md q-mt-lg">
        <!-- Tab Content -->
        <div v-if="activeTab.tab === TAB_ABOUT" class="tab-content">
          <PublicAboutShopTab
            :shop-data="shopData"
            :working-hours="workingHours"
          />
        </div>
        <div v-else-if="activeTab.tab === TAB_ARTISTS" class="tab-content">
          <PublicShopArtistsTab :artists="artists" />
        </div>
        <div v-else-if="activeTab.tab === TAB_PORTFOLIO" class="tab-content">
          <PublicShopPortfolioTab :portfolio-items="portfolioItems" />
        </div>
      </div>
    </div>

    <!-- Create Booking Dialog -->
    <CreateBookingDialog
      v-model="showBookingDialog"
      :shop-uuid="shopData.uuid"
      type="shop-to-artist"
      @submit="handleBookingSubmit"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { IArtist } from 'src/interfaces/artist';
import type { IBooking } from 'src/interfaces/booking';
import type { IShop } from 'src/interfaces/shop';
import PublicAboutShopTab from 'src/components/PublicShopProfile/PublicAboutShopTab.vue';
import PublicShopArtistsTab from 'src/components/PublicShopProfile/PublicShopArtistsTab.vue';
import PublicShopPortfolioTab from 'src/components/PublicShopProfile/PublicShopPortfolioTab.vue';
import TabsComp from 'src/components/TabsComp.vue';
import { type ITab } from 'src/interfaces/tabs';
import { useFavorites } from 'src/modules/useFavorites';
import useShops from 'src/modules/useShops';
import CreateBookingDialog from 'src/components/Dialogs/CreateBookingDialog.vue';
import ImageCarousel from 'src/components/ImageCarousel.vue';

const { isShopFavorite, toggleShopFavorite } = useFavorites();
const { fetchShopByUuid } = useShops();
const route = useRoute();

const TAB_ABOUT = 'about';
const TAB_ARTISTS = 'artists';
const TAB_PORTFOLIO = 'portfolio';

const TABS: ITab[] = [
  {
    label: 'About shop',
    tab: TAB_ABOUT
  },
  {
    label: 'Artists',
    tab: TAB_ARTISTS
  },
  {
    label: 'Portfolio',
    tab: TAB_PORTFOLIO
  }
];

// Tab management
const activeTab = ref<ITab>(TABS[0]!);

const setActiveTab = (tab: ITab) => {
  activeTab.value = tab;
};

// Shop data from Supabase
const shopData = ref<IShop>({
  uuid: '',
  username: '',
  location: '',
  description: '',
  title: '',
  phone: '',
  email: '',
  dateOpened: '',
  workingHoursStart: '',
  workingHoursEnd: '',
  instagram: '',
  facebook: '',
  pictures: [],
});

// Working hours
const workingHours = ref({
  start: '',
  end: ''
});

// Artists data
const artists = ref<IArtist[]>([
  {
    uuid: '1',
    name: 'John Doe',
    bio: 'Experienced tattoo artist specializing in traditional American style tattoos with a modern twist.',
    avatar: 'artists/artist1.jpeg'
  },
  {
    uuid: '2',
    name: 'Jane Smith',
    bio: 'Creative artist known for beautiful watercolor style tattoos and unique designs.',
    avatar: 'artists/artist2.jpg'
  },
  {
    uuid: '3',
    name: 'Mike Johnson',
    bio: 'Master of realistic black and grey tattoos, specializing in portraits and detailed artwork.',
    avatar: 'artists/artist3.jpg'
  }
]);

// Portfolio data
const portfolioItems = ref([
  {
    uuid: '1',
    title: 'Traditional Sleeve Design',
    description: 'Full arm traditional American style tattoo with vibrant colors and classic motifs',
    pictures: ['examples/example1.jpg'],
    tags: ['Traditional', 'Sleeve', 'Color'],
    ownerUuid: '1'
  },
  {
    uuid: '2',
    title: 'Watercolor Floral Piece',
    description: 'Delicate watercolor style flower tattoo with soft edges and flowing colors',
    pictures: ['examples/example2.jpeg'],
    tags: ['Watercolor', 'Floral', 'Soft'],
    ownerUuid: '1'
  },
  {
    uuid: '3',
    title: 'Realistic Portrait',
    description: 'Detailed black and grey portrait tattoo showcasing realistic shading techniques',
    pictures: ['examples/example3.jpg'],
    tags: ['Realistic', 'Portrait', 'Black & Grey'],
    ownerUuid: '1'
  }
]);

// Computed properties for favorites
const isFavorite = computed(() => isShopFavorite(shopData.value.uuid));

// Methods
const toggleFavorite = () => {
  toggleShopFavorite(shopData.value);
};

// Booking dialog state
const showBookingDialog = ref(false);

const openBookingDialog = () => {
  showBookingDialog.value = true;
};

const handleBookingSubmit = (bookingData: Partial<IBooking>) => {
  console.log('Booking submitted:', bookingData);
  showBookingDialog.value = false;
};

// Fetch shop data on component mount
const loadShopData = async () => {
  const uuid = route.params.id as string;
  if (uuid) {
    const data = await fetchShopByUuid(uuid);
    if (data) {
      shopData.value = data;

      // Update working hours
      workingHours.value = {
        start: data.workingHoursStart || '',
        end: data.workingHoursEnd || ''
      };

      // In a real application, you would also fetch artists and portfolio items related to this shop
      // For now we'll keep the mock data for these sections
    }
  }
};

onMounted(async () => {
  await loadShopData();
});
</script>

<style scoped lang="scss">
.content {
  width: 100%;
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
  min-height: 200px;
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
