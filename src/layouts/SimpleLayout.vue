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
</script>
