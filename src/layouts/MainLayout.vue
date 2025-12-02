<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <PullToRefresh>
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" v-if="$route.meta.keepAlive" />
          </keep-alive>
          <component :is="Component" v-if="!$route.meta.keepAlive" />
        </router-view>
      </PullToRefresh>
    </q-page-container>

    <TheFooter />

    <!-- Profile Overlays -->
    <PublicArtistProfileOverlay
      :document-id="profileState.type === 'artist' ? profileState.documentId : null"
      :is-open="profileState.isOpen && profileState.type === 'artist'"
    />
    <PublicShopProfileOverlay
      :document-id="profileState.type === 'shop' ? profileState.documentId : null"
      :is-open="profileState.isOpen && profileState.type === 'shop'"
    />
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TheFooter from '../components/TheFooter.vue';
import PullToRefresh from '../components/PullToRefresh.vue';
import { PublicArtistProfileOverlay, PublicShopProfileOverlay } from 'src/components/Dialogs';
import { useProfileOverlay } from 'src/composables/useProfileOverlay';

const { state } = useProfileOverlay();
const profileState = computed(() => state.value);
</script>
