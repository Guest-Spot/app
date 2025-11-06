<template>
  <!-- Shop Profile -->
  <ShopProfile v-if="isShop" />

  <!-- Artist Profile -->
  <ArtistProfile v-else-if="isArtist" />

  <!-- Guest Profile -->
  <GuestProfile v-else-if="isGuest" />

  <SingInToContinue v-else-if="!hasTokens" class="fixed-center full-width" title="My Profile" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import useUser from 'src/modules/useUser';
import useTokens from 'src/modules/useTokens';
import ShopProfile from 'src/pages/ShopProfile.vue';
import ArtistProfile from 'src/pages/ArtistProfile.vue';
import GuestProfile from 'src/pages/GuestProfile.vue';
import SingInToContinue from 'src/components/SingInToContinue.vue';

const { isShop, isArtist, isGuest } = useUser();
const { getStoredTokens } = useTokens();

const hasTokens = computed(() => getStoredTokens()?.accessToken);
</script>
