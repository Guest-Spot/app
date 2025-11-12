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
          class="relative-position"
          :class="{ 'text-primary bg-block': link.isActive }"
          @click="$router.push(link.path)"
        >
          <q-icon :name="link.icon" :class="{ 'text-primary': link.isActive }">
            <q-badge
              v-if="link.showBadge"
              color="primary"
              floating
              rounded
              class="footer-badge"
            />
          </q-icon>
        </q-btn>
      </q-toolbar-title>
    </q-toolbar>
  </q-footer>
</template>

<script setup lang="ts">
import { useUserStore } from 'src/stores/user';
import { useNotifiesStore } from 'src/stores/notifies';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { UserType } from 'src/interfaces/enums';

// Footer component with navigation icons
defineOptions({
  name: 'TheFooter',
});

const route = useRoute();
const userStore = useUserStore();
const notifiesStore = useNotifiesStore();

const bookings = {
  [UserType.Shop]: {
    icon: 'event_note',
    label: 'Bookings',
    path: '/bookings',
  },
  [UserType.Artist]: {
    icon: 'event',
    label: 'Events',
    path: '/events',
  },
  [UserType.Guest]: {
    icon: 'event',
    label: 'My Bookings',
    path: '/my-bookings',
  },
};

const LINKS = computed(() => {
  return [
    {
      icon: 'search',
      label: 'Search',
      path: '/',
      isActive: route.path === '/',
    },
    {
      icon: 'dashboard',
      label: 'Feed',
      path: '/feed',
      isActive: route.path === '/feed',
    },
    {
      icon: bookings[userStore.user?.type || UserType.Guest]?.icon,
      label: bookings[userStore.user?.type || UserType.Guest]?.label,
      path: bookings[userStore.user?.type || UserType.Guest]?.path,
      isActive: route.path === bookings[userStore.user?.type || UserType.Guest]?.path,
    },
    {
      icon: 'person',
      label: 'Profile',
      path: '/profile',
      isActive: route.path === '/profile',
      showBadge: notifiesStore.getHasNewNotifies,
    },
  ];
});
</script>

<style scoped lang="scss">
.footer-toolbar {
  padding: 0 0 24px 0 !important;
  min-height: auto !important;
}

.footer-badge {
  min-width: 8px;
  min-height: 8px;
  padding: 0;
}
</style>
