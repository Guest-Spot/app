<template>
  <div class="profile-router">
    <!-- Shop Profile -->
    <ShopProfile v-if="isShop" />

    <!-- Artist Profile -->
    <ArtistProfile v-else-if="isArtist" />

    <!-- Loading or redirect -->
    <div v-else class="loading-container">
      <q-spinner-dots size="50px" color="dark" />
      <p class="q-mt-md">Redirecting to login...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import useUser from 'src/modules/useUser';
import ShopProfile from 'src/pages/ShopProfile.vue';
import ArtistProfile from 'src/pages/ArtistProfile.vue';

const router = useRouter();
const { isShop, isArtist, isAuthenticated } = useUser();

onBeforeMount(() => {
  if (!isAuthenticated.value) {
    if (isShop.value) {
      void router.push('/login/shop');
    } else if (isArtist.value) {
      void router.push('/login/artist');
    } else {
      void router.push('/auth');
    }
  }
});
</script>

<style scoped lang="scss">
.profile-router {
  position: relative;
  min-height: 100vh;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}
</style>
