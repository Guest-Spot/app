<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="container">
      <ProfileHeader class="q-mb-md" :name="profile?.name || ''" @openPublicProfile="openPublicProfile" />
    </div>

    <div class="container">
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
      <!-- Tab Content -->
      <AboutMeTab v-if="activeTab.tab === TAB_ABOUT" />
      <PortfolioTab v-else-if="activeTab.tab === TAB_PORTFOLIO" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { AboutMeTab, PortfolioTab } from 'src/components/ArtistProfile';
import { TabsComp } from 'src/components';
import { type ITab } from 'src/interfaces/tabs';
import ProfileHeader from 'src/components/Profile/ProfileHeader.vue';
import { useProfileStore } from 'src/stores/profile';
import { useRouter } from 'vue-router';

const profileStore = useProfileStore();
const profile = computed(() => profileStore.getArtistProfile);

const TAB_ABOUT = 'about';
const TAB_PORTFOLIO = 'portfolio';

const TABS: ITab[] = [
  {
    label: 'About me',
    tab: TAB_ABOUT,
  },
  {
    label: 'Portfolio',
    tab: TAB_PORTFOLIO,
  },
];

const router = useRouter();

// Tab management
const activeTab = ref<ITab>(TABS[0]!);

const setActiveTab = (tab: ITab) => {
  activeTab.value = tab;
};

const openPublicProfile = () => {
  void router.push(`/artist/${profile.value?.documentId}`);
};
</script>
