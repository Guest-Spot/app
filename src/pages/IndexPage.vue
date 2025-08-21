<template>
  <q-page class="flex flex-center">
    <div class="text-center">
      <q-icon name="search" size="100px" color="primary" />
      <h4 class="q-mt-md">Welcome to GuestSpot</h4>
      <p class="text-grey-6 q-mb-lg">Discover tattoo artists and studios</p>
      
      <q-btn
        color="primary"
        size="lg"
        @click="goToAuth"
        class="q-mt-md"
      >
        <q-icon name="login" class="q-mr-sm" />
        Get Started
      </q-btn>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goToAuth = () => {
  void router.push('/auth');
};
</script>
