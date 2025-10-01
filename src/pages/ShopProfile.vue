<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="container">
      <ProfileHeader
        class="q-mb-md"
        :name="profile?.name || 'Shop'"
        @openPublicProfile="openPublicProfile"
      />
    </div>

    <div class="container">
      <!-- Navigation Tabs -->
      <TabsComp
        :tabs="TABS"
        :activeTab="activeTab"
        use-query
        send-initial-tab
        @setActiveTab="setActiveTab"
        class="full-width"
      />
    </div>

    <div class="container">
      <!-- Main Content Area -->
      <div class="main-content flex column q-gap-md">
        <!-- Tab Content -->
        <AboutShopTab v-if="activeTab.tab === TAB_ABOUT" class="tab-content" />
        <ShopArtistsTab v-if="activeTab.tab === TAB_ARTISTS" class="tab-content" />
        <PortfolioTab
          v-if="activeTab.tab === TAB_PORTFOLIO"
          profile-type="shop"
          class="tab-content"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { AboutShopTab, ShopArtistsTab } from 'src/components/ShopProfile';
import { TabsComp, PortfolioTab } from 'src/components';
import { type ITab } from 'src/interfaces/tabs';
import ProfileHeader from 'src/components/Profile/ProfileHeader.vue';
import { useProfileStore } from 'src/stores/profile';
import { useRouter } from 'vue-router';

const profileStore = useProfileStore();
const profile = computed(() => profileStore.getShopProfile);

const TAB_ABOUT = 'about';
const TAB_ARTISTS = 'artists';
const TAB_PORTFOLIO = 'portfolio';

const TABS: ITab[] = [
  {
    label: 'About shop',
    tab: TAB_ABOUT,
  },
  {
    label: 'Shop Artists',
    tab: TAB_ARTISTS,
  },
  {
    label: 'Portfolio',
    tab: TAB_PORTFOLIO,
  },
];

// Tab management
const activeTab = ref<ITab>(TABS[0]!);
const router = useRouter();

const setActiveTab = (tab: ITab) => {
  activeTab.value = tab;
};

const openPublicProfile = () => {
  void router.push(`/shop/${profile.value?.documentId}`);
};
</script>

<style scoped lang="scss">
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

.tab-content {
  width: 100%;
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
