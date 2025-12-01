<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <PullToRefresh>
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" v-if="$route.meta.keepAlive" />
          </keep-alive>
          <component :is="Component" v-if="!$route.meta.keepAlive" />
        </router-view>
      </PullToRefresh>
    </q-page-container>

    <TheFooter />
  </q-layout>
</template>

<script setup lang="ts">
import TheFooter from '../components/TheFooter.vue';
import PullToRefresh from '../components/PullToRefresh.vue';
</script>
