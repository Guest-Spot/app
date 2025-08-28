<template>
  <q-footer class="custom-footer">
    <q-toolbar class="footer-toolbar">
      <q-toolbar-title class="row justify-around q-py-sm">
        <q-btn
          v-for="link in LINKS"
          :key="link.path"
          flat 
          round 
          color="grey-6"
          :aria-label="link.label"
          :class="{ 'text-primary': link.isActive }"
          @click="$router.push(link.path)"
        >
          <q-icon :name="link.icon" :class="{ 'text-primary': link.isActive }" />
        </q-btn>
      </q-toolbar-title>
    </q-toolbar>
  </q-footer>
</template>

<script setup lang="ts">
import { useUserStore } from 'src/stores/user-store';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

// Footer component with navigation icons
defineOptions({
  name: 'TheFooter'
});

const route = useRoute();

const LINKS = computed(() => [
  {
    icon: 'bookmark',
    label: 'Bookmarks',
    path: '/bookmarks',
    isActive: route.path === '/bookmarks'
  },
  {
    icon: 'search',
    label: 'Search',
    path: '/',
    isActive: route.path === '/'
  },
  {
    icon: userStore.isShop ? 'event_note' : 'event',
    label: 'Bookings',
    path: '/bookings',
    isActive: route.path === '/bookings' || route.path === '/trips-bookings'
  },
  {
    icon: 'person',
    label: 'Profile',
    path: '/profile',
    isActive: route.path === '/profile'
  }
])

const userStore = useUserStore();
</script>

<style scoped lang="scss">
.footer-toolbar {
  padding: 0 !important;
  min-height: auto !important;
}

.custom-footer {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.6);
  border-top-left-radius: var(--border-radius-xl);
  border-top-right-radius: var(--border-radius-xl);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.body--dark .custom-footer {
  background: rgba(var(--bg-block-rgb), 0.6);
}
</style>
