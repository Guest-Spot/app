<template>
  <div class="profile-router">
    <!-- Shop Profile -->
    <ProfilePage v-if="userStore.isShop" />
    
    <!-- Artist Profile -->
    <ArtistProfile v-else-if="userStore.isArtist" />
    
    <!-- Loading or redirect -->
    <div v-else class="loading-container">
      <q-spinner-dots size="50px" color="dark" />
      <p class="q-mt-md">Redirecting to login...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from 'src/stores/user-store';
import ProfilePage from 'src/pages/ProfilePage.vue';
import ArtistProfile from 'src/pages/ArtistProfile.vue';

const router = useRouter();
const userStore = useUserStore();

onMounted(() => {
  // Initialize user store from localStorage
  userStore.initFromStorage();
  
  // If not authenticated, redirect to appropriate login page
  if (!userStore.isAuthenticated) {
    // Check if there was a previous user type to redirect appropriately
    const storedUser = localStorage.getItem('guestspot_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.type === 'shop') {
          void router.push('/login/shop');
        } else if (userData.type === 'artist') {
          void router.push('/login/artist');
        } else {
          void router.push('/auth');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        void router.push('/auth');
      }
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
