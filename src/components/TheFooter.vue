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
          @click="handleClick(link.path, link.event)"
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
import { computed, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { UserType } from 'src/interfaces/enums';
import type { EventBus } from 'quasar';

// Footer component with navigation icons
defineOptions({
  name: 'TheFooter',
});

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const notifiesStore = useNotifiesStore();
const bus = inject('bus') as EventBus;

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
      event: 'opened-search-page',
      isActive: route.path === '/',
    },
    {
      icon: 'dashboard',
      label: 'Feed',
      path: '/feed',
      event: 'opened-feed-page',
      isActive: route.path === '/feed',
    },
    {
      icon: bookings[userStore.user?.type || UserType.Guest]?.icon,
      label: bookings[userStore.user?.type || UserType.Guest]?.label,
      path: bookings[userStore.user?.type || UserType.Guest]?.path,
      event: 'opened-bookings-page',
      isActive: route.path === bookings[userStore.user?.type || UserType.Guest]?.path,
    },
    {
      icon: 'person',
      label: 'Profile',
      path: '/profile',
      event: 'opened-profile-page',
      isActive: route.path === '/profile',
      showBadge: notifiesStore.getHasNewNotifies,
    },
  ];
});

const handleClick = (path: string, event: string) => {
  bus.emit(event ?? '');
  void router.push(path);
};
</script>

<style scoped lang="scss">
.footer-toolbar {
  padding: 0 0 var(safe-area-inset-bottom) 0 !important;
  min-height: auto !important;
}

.footer-badge {
  min-width: 8px;
  min-height: 8px;
  padding: 0;
}
</style>
