<template>
  <q-header elevated>
    <q-toolbar>
      <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

      <q-toolbar-title> GuestSpot </q-toolbar-title>
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
