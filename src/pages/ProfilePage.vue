<template>
  <q-page class="q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="container">
      <!-- Navigation Tabs -->
      <TabsComp
        :tabs="TABS"
        :activeTab="activeTab"
        use-query
        @setActiveTab="setActiveTab"
        class="q-mb-lg"
      />

      <!-- Main Content Area -->
      <div class="main-content flex column q-gap-md">
        <!-- Tab Content -->
        <div v-if="activeTab.tab === TAB_ABOUT" class="tab-content">
          <AboutShopTab />
        </div>
        <div v-else-if="activeTab.tab === TAB_ARTISTS" class="tab-content">
          <ShopArtistsTab />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { AboutShopTab, ShopArtistsTab } from 'src/components/ProfilePage';
import { TabsComp } from 'src/components';
import { type ITab } from 'src/interfaces/tabs';

const TAB_ABOUT = 'about';
const TAB_ARTISTS = 'artists';

const TABS: ITab[] = [
  {
    label: 'About shop',
    tab: TAB_ABOUT
  },
  {
    label: 'Shop Artists',
    tab: TAB_ARTISTS
  }
];

// Tab management
const activeTab = ref<ITab>(TABS[0]!);



const setActiveTab = (tab: ITab) => {
  activeTab.value = tab;
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
