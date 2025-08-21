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
.custom-footer {
  margin-bottom: 16px;
  margin-left: 16px;
  margin-right: 16px;
  background: white !important;
  border-radius: 24px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.footer-toolbar {
  background: white;
}

.custom-footer .q-btn {
  color: var(--text-dark, #333) !important;
  background: transparent !important;
  transition: all 0.3s ease;
}

.custom-footer .q-btn:hover {
  background: rgba(0, 0, 0, 0.05) !important;
}

.custom-footer .q-btn.bg-dark {
  background: var(--brand-dark, #333) !important;
  color: white !important;
}

.custom-footer .q-icon {
  color: var(--text-dark, #333) !important;
}
</style>
