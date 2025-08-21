<template>
  <q-header elevated class="custom-header">
    <q-toolbar class="header-toolbar">
      <q-btn 
        flat 
        dense 
        round 
        icon="menu" 
        aria-label="Menu" 
        @click="toggleLeftDrawer"
        class="menu-btn"
      />

      <q-toolbar-title class="header-title"> GuestSpot </q-toolbar-title>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { inject } from 'vue';

// Inject the toggle function from parent component
const toggleLeftDrawer = inject<() => void>('toggleLeftDrawer', () => {});

// Export component for TypeScript
defineOptions({
  name: 'TheHeader'
});
</script>

<style scoped>
.custom-header {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.menu-btn {
  color: var(--text-dark, #333);
  background: transparent;
  transition: all 0.3s ease;
}

.menu-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.header-title {
  color: var(--text-dark, #333);
  font-weight: 600;
}
</style>
