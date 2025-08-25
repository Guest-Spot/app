<template>
  <q-header elevated class="custom-header">
    <q-toolbar class="header-toolbar q-px-md">
      <!-- Back Button - only show when hasBack is true in route meta -->
      <q-btn
        v-if="showBackButton"
        icon="arrow_back"
        round
        dense
        text-color="grey-6"
        @click="handleBack"
        class="back-btn"
        aria-label="Go back"
      />
      
      <q-toolbar-title class="header-title"> {{ pageTitle }} </q-toolbar-title>
      
      <!-- Logout Button - only show on profile pages -->
      <q-btn
        v-if="isProfilePage"
        text-color="negative"
        icon="logout"
        size="sm"
        round
        @click="handleLogout"
        class="logout-btn"
      />
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from 'src/stores/user-store';

// Export component for TypeScript
defineOptions({
  name: 'TheHeader'
});

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// Check if current page is a profile page
const isProfilePage = computed(() => {
  const profileRoutes = ['/profile', '/artist-profile'];
  return profileRoutes.some(profileRoute => profileRoute === route.path);
});

// Get page title based on current route
const pageTitle = computed(() => {
  // Get title from route meta, fallback to 'GuestSpot' if not found
  return route.meta?.title || 'GuestSpot';
});

const showBackButton = computed(() => {
  return route.meta?.hasBack;
});

const handleBack = () => {
  router.back();
};

const handleLogout = () => {
  // Logout user from store (this will clear localStorage)
  userStore.logout();
  
  // Redirect to appropriate login page based on user type
  if (userStore.type === 'shop') {
    void router.push('/login/shop');
  } else if (userStore.type === 'artist') {
    void router.push('/login/artist');
  } else {
    // Default to auth page
    void router.push('/auth');
  }
};
</script>

<style scoped lang="scss">
.custom-header {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.header-title {
  color: var(--text-dark, #333);
  font-weight: 600;
  line-height: normal;
}

.logout-btn {
  font-weight: 600;
  transition: all 0.3s ease;
}

.back-btn {
  color: var(--text-dark, #333);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
    transform: scale(1.1);
  }
}
</style>
