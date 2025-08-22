<template>
  <q-layout view="lHh Lpr lFf">
    <TheHeader />

    <SideDrawer v-model="leftDrawerOpen" />

    <q-page-container>
      <router-view />
    </q-page-container>

    <TheFooter />
  </q-layout>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue';
import SideDrawer from '../components/SideDrawer.vue';
import TheFooter from '../components/TheFooter.vue';
import TheHeader from '../components/TheHeader.vue';

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

// Provide the toggle function to child components
provide('toggleLeftDrawer', toggleLeftDrawer);
</script>
