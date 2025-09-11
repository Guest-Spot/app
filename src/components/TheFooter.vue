<template>
  <q-footer class="custom-footer bg-block">
    <q-toolbar class="footer-toolbar">
      <q-toolbar-title class="row justify-around q-py-sm">
        <q-btn
          v-for="link in LINKS"
          :key="link.path"
          flat
          round
          color="grey-6"
          :aria-label="link.label"
          :class="{ 'text-primary bg-block': link.isActive }"
          @click="$router.push(link.path)"
        >
          <q-icon :name="link.icon" :class="{ 'text-primary': link.isActive }" />
        </q-btn>
      </q-toolbar-title>
    </q-toolbar>
  </q-footer>
</template>

<script setup lang="ts">
import { useUserStore } from 'src/stores/user';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

// Footer component with navigation icons
defineOptions({
  name: 'TheFooter',
});

const route = useRoute();
const userStore = useUserStore();

const LINKS = computed(() => [
  {
    icon: 'search',
    label: 'Search',
    path: '/',
    isActive: route.path === '/',
  },
  {
    icon: 'bookmark',
    label: 'Bookmarks',
    path: '/bookmarks',
    isActive: route.path === '/bookmarks',
  },
  {
    icon: userStore.isShop ? 'event_note' : 'event',
    label: 'Bookings',
    path: userStore.isShop ? '/bookings' : '/trips-bookings',
    isActive: route.path === '/bookings' || route.path === '/trips-bookings',
  },
  {
    icon: 'person',
    label: 'Profile',
    path: '/profile',
    isActive: route.path === '/profile',
  },
]);
</script>

<style scoped lang="scss">
.footer-toolbar {
  padding: 0 0 24px 0 !important;
  min-height: auto !important;
}
</style>
