<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="container">
      <ProfileHeader
        class="q-mb-md"
        :name="user?.name || 'Artist'"
        @openPublicProfile="openPublicProfile"
      />
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
      <AboutMeTab v-show="activeTab.tab === TAB_ABOUT" />
      <PortfolioTab v-show="activeTab.tab === TAB_PORTFOLIO" profile-type="artist" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { AboutMeTab } from 'src/components/ArtistProfile';
import { PortfolioTab } from 'src/components';
import { TabsComp } from 'src/components';
import { type ITab } from 'src/interfaces/tabs';
import ProfileHeader from 'src/components/Profile/ProfileHeader.vue';
import useUser from 'src/modules/useUser';
import { useRouter } from 'vue-router';

const { user } = useUser();

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
  void router.push(`/artist/${user.value?.documentId}`);
};
</script>
