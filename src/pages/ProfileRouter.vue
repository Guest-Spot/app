<template>
  <!-- Shop Profile -->
  <ShopProfile v-if="isShop" />

  <!-- Artist Profile -->
  <ArtistProfile v-else-if="isArtist" />

  <!-- Guest Profile -->
  <GuestProfile v-else-if="isGuest" />

  <SingInToContinue v-else class="fixed-center full-width" title="My Profile" />
</template>

<script setup lang="ts">
import useUser from 'src/modules/useUser';
import ShopProfile from 'src/pages/ShopProfile.vue';
import ArtistProfile from 'src/pages/ArtistProfile.vue';
import GuestProfile from 'src/pages/GuestProfile.vue';
import SingInToContinue from 'src/components/SingInToContinue.vue';

const { isShop, isArtist, isGuest } = useUser();
</script>
