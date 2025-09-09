<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import useUser from 'src/modules/useUser';

/**
 * App Component
 * Handles session restoration after all boot files are loaded
 */
const { restoreSession } = useUser();

onMounted(() => {
  console.log('🔑 Starting authentication restore...');

  // Run session restore after app is mounted and Apollo is available
  restoreSession()
    .then(() => {
      console.log('✅ Authentication restore completed');
    })
    .catch((error) => {
      console.warn('⚠️ Authentication restore failed:', error);
      // Don't block app startup on auth errors
    });
});
</script>
