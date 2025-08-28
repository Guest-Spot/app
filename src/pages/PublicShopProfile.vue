<template>
  <q-page class="q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="q-my-auto full-width">
      <div class="container">
        <div class="content full-width q-pa-md">
          <!-- Profile Header Section -->
          <div class="profile-header">
            <div class="profile-info-container flex column">
              <div class="profile-picture">
                <q-img
                  v-if="shopData.avatar"
                  :src="shopData.avatar"
                  :ratio="1"
                  spinner-color="dark"
                  spinner-size="32px"
                />
                <q-icon v-else name="store" size="80px" color="grey-6" />
              </div>
              <div class="user-details flex column items-center q-gap-md full-width">
                <div class="flex column items-center">
                  <span class="full-name text-h6">{{ shopData.title }}</span>
                  <span class="status text-body2 text-center">{{ shopData.description }}</span>
                </div>
                <div class="flex row items-center q-gap-sm full-width no-wrap">
                  <q-btn
                    color="primary"
                    text-color="white"
                    class="full-width"
                    unelevated
                    rounded
                    @click="openBookingDialog"
                  >
                    <span class="text-body2">Booking request</span>
                    <q-icon name="send" size="16px" color="white" class="q-ml-sm" />
                  </q-btn>
                  <q-btn
                    round
                    flat
                    dense
                    :color="isFavorite ? 'red' : 'grey-6'"
                    @click="toggleFavorite"
                    class="favorite-btn"
                  >
                    <q-icon v-if="isFavorite" name="favorite" size="18px" color="red" />
                    <q-icon v-else name="favorite_border" size="18px" color="red" />
                  </q-btn>
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
          class="q-my-lg full-width"
        />

        <!-- Main Content Area -->
        <div class="main-content flex column q-gap-md">
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
    </div>

    <!-- Create Booking Dialog -->
    <CreateBookingDialog
      v-model="showBookingDialog"
      :shop-id="shopData.id"
      :artist-id="0"
      type="shop-to-artist"
      @submit="handleBookingSubmit"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { IArtist } from 'src/interfaces/artist';
import type { IBooking } from 'src/interfaces/booking';
import PublicAboutShopTab from 'src/components/PublicShopProfile/PublicAboutShopTab.vue';
import PublicShopArtistsTab from 'src/components/PublicShopProfile/PublicShopArtistsTab.vue';
import PublicShopPortfolioTab from 'src/components/PublicShopProfile/PublicShopPortfolioTab.vue';
import TabsComp from 'src/components/TabsComp.vue';
import { type ITab } from 'src/interfaces/tabs';
import { useFavorites } from 'src/modules/useFavorites';
import CreateBookingDialog from 'src/components/Dialogs/CreateBookingDialog.vue';

const { isShopFavorite, toggleShopFavorite } = useFavorites();

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

// Mock shop data - в реальном приложении будет загружаться по ID
const shopData = ref({
  id: 1,
  username: 'ink_paradise',
  location: 'Downtown, NY',
  status: 'Open for business',
  description: 'Professional tattoo studio with 15+ years of experience in creating unique and beautiful tattoos.',
  avatar: 'https://picsum.photos/300/300?random=1',
  title: 'Ink Paradise Tattoo Studio',
  phone: '+1 (555) 123-4567',
  email: 'info@inkparadise.com',
  dateOpened: '2009-03-15',
  workingHoursStart: '10:00',
  workingHoursEnd: '22:00',
  instagram: 'https://instagram.com/inkparadise_ny',
  facebook: 'https://facebook.com/inkparadise.ny',
});

// Mock working hours
const workingHours = ref({
  start: '10:00',
  end: '22:00'
});

// Mock artists data
const artists = ref<IArtist[]>([
  {
    id: 1,
    name: 'John Doe',
    specialty: 'Traditional Tattoo',
    bio: 'Experienced tattoo artist specializing in traditional American style tattoos with a modern twist.',
    avatar: 'https://picsum.photos/80/80?random=1'
  },
  {
    id: 2,
    name: 'Jane Smith',
    specialty: 'Watercolor Tattoo',
    bio: 'Creative artist known for beautiful watercolor style tattoos and unique designs.',
    avatar: 'https://picsum.photos/80/80?random=2'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    specialty: 'Black & Grey Realism',
    bio: 'Master of realistic black and grey tattoos, specializing in portraits and detailed artwork.',
    avatar: 'https://picsum.photos/80/80?random=3'
  }
]);

// Mock portfolio data
const portfolioItems = ref([
  {
    id: 1,
    title: 'Traditional Sleeve Design',
    description: 'Full arm traditional American style tattoo with vibrant colors and classic motifs',
    imageUrl: 'https://picsum.photos/300/300?random=4',
    tags: ['Traditional', 'Sleeve', 'Color']
  },
  {
    id: 2,
    title: 'Watercolor Floral Piece',
    description: 'Delicate watercolor style flower tattoo with soft edges and flowing colors',
    imageUrl: 'https://picsum.photos/300/300?random=5',
    tags: ['Watercolor', 'Floral', 'Soft']
  },
  {
    id: 3,
    title: 'Realistic Portrait',
    description: 'Detailed black and grey portrait tattoo showcasing realistic shading techniques',
    imageUrl: 'https://picsum.photos/300/300?random=6',
    tags: ['Realistic', 'Portrait', 'Black & Grey']
  }
]);

// Computed properties for favorites
const isFavorite = computed(() => isShopFavorite(shopData.value.id));

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
  overflow: hidden;
  border: 1px solid var(--shadow-light);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
}

.profile-picture {
  width: 100%;
  height: 150px;
  overflow: hidden;

  :deep(.q-img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.user-details {
  flex: 1;
  text-align: left;
  padding: 20px;
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
  border: 1px solid var(--shadow-light);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}
</style>
