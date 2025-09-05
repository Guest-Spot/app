<template>
  <div class="flex column items-center justify-center">
    <h2 class="text-h5 q-my-none">{{ title }}</h2>
    <p class="text-subtitle1 text-grey-6">Please sign in to continue</p>
    <q-btn
      unelevated
      rounded
      color="primary"
      label="Sign in"
      class="min-w-100px"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<style scoped lang="scss">
.min-w-100px {
  min-width: 100px;
}
</style>
