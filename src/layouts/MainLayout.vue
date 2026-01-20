<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <PullToRefresh>
        <router-view v-slot="{ Component, route }">
          <keep-alive :include="keepAlivePages">
            <component :is="Component" :key="route.name ?? route.path" />
          </keep-alive>
        </router-view>
      </PullToRefresh>
    </q-page-container>

    <TheFooter />
  </q-layout>
</template>

<script setup lang="ts">
import TheFooter from '../components/TheFooter.vue';
import PullToRefresh from '../components/PullToRefresh.vue';

const keepAlivePages = ['IndexPage', 'FeedPage'];
</script>
