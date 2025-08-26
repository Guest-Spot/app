<template>
  <q-footer class="custom-footer">
    <q-toolbar class="footer-toolbar">
      <q-toolbar-title class="row justify-around q-py-sm">
        <q-btn 
          flat 
          round 
          icon="bookmark" 
          aria-label="Bookmarks"
          :class="{ 'bg-dark text-white': $route.path === '/bookmarks' }"
          @click="$router.push('/bookmarks')"
        />
        <q-btn 
          flat 
          round 
          icon="search" 
          aria-label="Search"
          :class="{ 'bg-dark text-white': $route.path === '/' }"
          @click="$router.push('/')"
        />
        <q-btn 
          flat 
          round 
          icon="event" 
          aria-label="Trips & Bookings"
          :class="{ 'bg-dark text-white': $route.path === '/trips-bookings' }"
          @click="$router.push('/trips-bookings')"
        />
        <q-btn 
          flat 
          round 
          icon="person" 
          aria-label="Profile"
          :class="{ 'bg-dark text-white': $route.path === '/profile' }"
          @click="$router.push('/profile')"
        />
      </q-toolbar-title>
    </q-toolbar>
  </q-footer>
</template>

<script setup lang="ts">
// Footer component with navigation icons
defineOptions({
  name: 'TheFooter'
});
</script>

<style scoped>
.footer-toolbar {
  padding: 0 !important;
  min-height: auto !important;
}

.custom-footer {
  margin-bottom: 16px;
  margin-left: 16px;
  margin-right: 16px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.custom-footer .q-btn {
  color: var(--text-dark, #333);
  background: transparent;
  transition: all 0.3s ease;
}

.custom-footer .q-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.custom-footer .q-btn.bg-dark {
  background: var(--brand-dark, #333);
  color: white;
}

.custom-footer .q-icon {
  color: var(--text-dark, #333);
}
</style>
