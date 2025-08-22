<template>
  <div class="profile-router">
    <!-- Shop Profile -->
    <ProfilePage v-if="userStore.isShop" />
    
    <!-- Artist Profile -->
    <ArtistProfile v-else-if="userStore.isArtist" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from 'src/stores/user-store';
import ProfilePage from 'src/pages/ProfilePage.vue';
import ArtistProfile from 'src/pages/ArtistProfile.vue';

const userStore = useUserStore();

onMounted(() => {
  if (!userStore.isAuthenticated) {
    userStore.loginAsArtist();
  }
});
</script>

<style scoped lang="scss">
.profile-router {
  position: relative;
  min-height: 100vh;
}
</style>
