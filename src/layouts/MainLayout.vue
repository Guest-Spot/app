<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <PullToRefresh>
        <router-view />
      </PullToRefresh>
    </q-page-container>

    <TheFooter />
  </q-layout>
</template>

<script setup lang="ts">
import TheFooter from '../components/TheFooter.vue';
import PullToRefresh from '../components/PullToRefresh.vue';
</script>
