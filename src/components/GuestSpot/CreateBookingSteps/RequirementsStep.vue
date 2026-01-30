<template>
  <div class="step-content">
    <InfoCard
      title="Shop description"
      icon="description"
      :data="[{ label: '', value: requirementsText }]"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { InfoCard } from 'src/components';

const props = defineProps<{
  description?: string | null;
}>();

const requirementsText = computed(
  () => (props.description?.trim() || '') || 'No description provided.',
);
</script>

<style scoped lang="scss">
.step-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 20px;
}
</style>
