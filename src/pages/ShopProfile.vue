<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="container">
      <ProfileHeader
        class="q-mb-md"
        :name="user?.name || user?.username || 'Shop'"
        sub-title="My Profile"
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
      <ShopArtistsTab v-show="activeTab.tab === TAB_ARTISTS" />
      <PortfolioTab v-show="activeTab.tab === TAB_PORTFOLIO" profile-type="shop" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { type ITab } from 'src/interfaces/tabs';
import AboutMeTab from 'src/components/Profile/AboutMeTab.vue';
import { ShopArtistsTab } from 'src/components/ShopProfile';
import { TabsComp, PortfolioTab } from 'src/components';
import ProfileHeader from 'src/components/Profile/ProfileHeader.vue';
import { useRouter } from 'vue-router';
import useUser from 'src/modules/useUser';

const { user } = useUser();

const TAB_ABOUT = 'about';
const TAB_ARTISTS = 'artists';
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
  {
    label: 'Shop Artists',
    tab: TAB_ARTISTS,
  },
];

// Tab management
const activeTab = ref<ITab>(TABS[0]!);
const router = useRouter();

const setActiveTab = (tab: ITab) => {
  activeTab.value = tab;
};

const openPublicProfile = () => {
  void router.push(`/shop/${user.value?.documentId}`);
};
</script>
