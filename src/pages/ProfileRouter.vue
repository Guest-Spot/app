<template>
  <div class="profile-router">
    <!-- Shop Profile -->
    <ShopProfile v-if="isShop" />

    <!-- Artist Profile -->
    <ArtistProfile v-else-if="isArtist" />

    <SingInToContinue v-else class="fixed-center full-width" title="My Profile" />
  </div>
</template>

<script setup lang="ts">
import useUser from 'src/modules/useUser';
import ShopProfile from 'src/pages/ShopProfile.vue';
import ArtistProfile from 'src/pages/ArtistProfile.vue';
import SingInToContinue from 'src/components/SingInToContinue.vue';

const { isShop, isArtist } = useUser();
</script>
