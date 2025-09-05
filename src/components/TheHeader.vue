<template>
  <q-header elevated class="custom-header bg-block">
    <q-toolbar class="header-toolbar q-px-md">
      <!-- Back Button - only show when hasBack is true in route meta -->
      <q-btn
        v-if="showBackButton"
        icon="chevron_left"
        round
        dense
        text-color="grey-6"
        @click="handleBack"
        class="back-btn"
        aria-label="Go back"
      />

      <q-toolbar-title v-if="isProfilePage" class="header-title">
        Welcome, <span class="text-primary">{{ profile?.fullname }}</span>
      </q-toolbar-title>
      <q-toolbar-title v-else class="header-title">
        {{ pageTitle }}
      </q-toolbar-title>

      <!-- Logout Button - only show on profile pages -->
      <q-btn
        v-if="isProfilePage"
        text-color="negative"
        icon="logout"
        size="sm"
        round
        @click="handleLogout"
        class="bg-block logout-btn"
      />
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useUser from 'src/modules/useUser';

// Export component for TypeScript
defineOptions({
  name: 'TheHeader'
});

const route = useRoute();
const router = useRouter();
const { logout, profile } = useUser();

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
  void logout();
  void router.push('/auth');
};
</script>

<style scoped lang="scss">
.custom-header {
  overflow: hidden;
}

.header-title {
  color: var(--text-dark);
  font-weight: 600;
  font-size: 18px;
  line-height: normal;
}

.logout-btn {
  font-weight: 600;
  transition: all 0.3s ease;
}

.back-btn {
  color: var(--text-dark);
  transition: all 0.3s ease;
}

.body--dark {
  .header-title {
    color: var(--text-white);
  }
}
</style>
