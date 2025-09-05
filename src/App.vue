<template>
  <router-view />
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue';
import useUser from 'src/modules/useUser';

const { fetchUserAndProfile } = useUser();

onBeforeMount(async () => {
  await fetchUserAndProfile();
});
</script>
