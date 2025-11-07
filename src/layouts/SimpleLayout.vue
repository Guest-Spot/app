<template>
  <q-layout view="hHh LpR fFf">
    <q-page-container>
      <PullToRefresh>
        <router-view />
      </PullToRefresh>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import PullToRefresh from '../components/PullToRefresh.vue';

// Auth layout without header and footer
</script>

<style scoped lang="scss">
.auth-page {
  min-height: 100vh;
  padding-bottom: 32px;
}
</style>
