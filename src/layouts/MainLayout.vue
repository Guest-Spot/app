<template>
  <q-layout view="lHh Lpr lFf">
    <TheHeader />

    <q-page-container>
      <router-view />
    </q-page-container>

    <TheFooter />
  </q-layout>
</template>

<script setup lang="ts">
import TheFooter from '../components/TheFooter.vue';
import TheHeader from '../components/TheHeader.vue';
</script>
