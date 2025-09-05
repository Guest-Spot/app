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
import { onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import useUser from 'src/modules/useUser';
import ShopProfile from 'src/pages/ShopProfile.vue';
import ArtistProfile from 'src/pages/ArtistProfile.vue';
import SingInToContinue from 'src/components/SingInToContinue.vue';

const router = useRouter();
const { isShop, isArtist, isAuthenticated } = useUser();

onBeforeMount(() => {
  if (isAuthenticated.value) {
    if (isShop.value) {
      void router.push('/login/shop');
    } else if (isArtist.value) {
      void router.push('/login/artist');
    }
  }
});
</script>
