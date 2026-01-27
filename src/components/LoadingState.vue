<template>
  <div class="flex column items-center q-gap-md bg-block border-radius-lg q-pa-lg">
    <q-spinner :name="spinnerName" size="32px" color="primary" />
    <div class="flex column items-center">
      <h3 class="loading-title">{{ title }}</h3>
      <p class="loading-description text-grey-6 text-center">{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isLoading: boolean;
  title: string;
  description: string;
  spinnerName?: string;
}>();
</script>

<style scoped lang="scss">
.loading-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.loading-description {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
}
</style>
