<template>
  <q-page class="q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="q-my-auto full-width">
      <div class="container">
        <div class="content full-width q-pa-md">
          <!-- Banner Image Section -->
          <ImageUploader />

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
              label="About shop"
              @click="setActiveTab(TAB_ABOUT)"
            />
            <q-btn
              class="tab-btn"
              :class="{ active: activeTab === TAB_ARTISTS }"
              unelevated
              rounded
              :outline="activeTab !== TAB_ARTISTS"
              :color="activeTab === TAB_ARTISTS ? 'dark' : 'grey-7'"
              :text-color="activeTab === TAB_ARTISTS ? 'white' : 'dark'"
              label="Shop Artists"
              @click="setActiveTab(TAB_ARTISTS)"
            />
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="main-content flex column q-gap-md">
          <!-- Tab Content -->
          <div v-if="activeTab === TAB_ABOUT" class="tab-content">
            <AboutShopTab />
          </div>
          <div v-else-if="activeTab === TAB_ARTISTS" class="tab-content">
            <ShopArtistsTab />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ImageUploader from 'src/components/ImageUploader.vue';
import AboutShopTab from 'src/components/ProfilePage/Shops/AboutShopTab.vue';
import ShopArtistsTab from 'src/components/ProfilePage/Shops/ShopArtistsTab.vue';

const TAB_ABOUT = 'about';
const TAB_ARTISTS = 'artists';

// Tab management
const activeTab = ref(TAB_ABOUT);

const setActiveTab = (tab: string) => {
  activeTab.value = tab;
};

// Methods to access child component data if needed in the future
// const getShopData = () => {
//   if (activeTab.value === 'about' && aboutShopTabRef.value) {
//     return {
//       shopData: aboutShopTabRef.value.shopData,
//       workingHours: aboutShopTabRef.value.workingHours
//     };
//   }
//   return null;
// };

// const getArtistsData = () => {
//   if (activeTab.value === 'artists' && shopArtistsTabRef.value) {
//     return {
//       artists: shopArtistsTabRef.value.artists
//     };
//   }
//   return null;
// };
</script>

<style scoped lang="scss">
.content {
  width: 100%;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 30px;
  box-shadow: 0 10px 30px var(--shadow-light);
}

.banner-section {
  text-align: center;
}

.banner-placeholder {
  border: 2px dashed var(--shadow-light);
  border-radius: 20px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
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

.tab-content {
  min-height: 400px;
}

.expansion-header {
  font-weight: 600;
  font-size: 18px;
  color: var(--brand-dark);
}

.info-section {
  padding: 16px;
}

.input-group {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.input-label {
  display: block;
  font-weight: 500;
  color: var(--brand-dark);
  margin-bottom: 8px;
  font-size: 14px;
}

.hours-container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.hours-group {
  flex: 1;
  min-width: 200px;
  position: relative;
}

.time-input {
  cursor: pointer;
  
  .q-field__control {
    cursor: pointer;
  }
}

.links-row {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.link-input-group {
  flex: 1;
  display: flex;
  gap: 10px;
  align-items: center;
}

.remove-link-btn {
  margin-bottom: 8px;
}

.save-section {
  margin-top: 20px;
  text-align: center;
}

.save-btn {
  background: var(--brand-dark);
  color: white;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.6px;
  text-transform: none;
  transition: all 0.3s ease;
  max-width: 300px;
}
</style>
