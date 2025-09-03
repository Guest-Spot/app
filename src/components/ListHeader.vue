<template>
  <div class="list-header bg-block border-radius-lg">
    <h3 v-if="title" class="text-subtitle1 text-bold q-my-none">{{ title }}</h3>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<style scoped lang="scss">
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 4px 4px 16px;
}
</style>
