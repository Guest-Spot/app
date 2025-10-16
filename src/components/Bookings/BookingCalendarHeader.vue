<template>
  <div class="calendar-header bg-block border-radius-lg q-px-md q-py-sm q-mb-md">
    <div class="flex items-center no-wrap justify-between q-gap-md full-width">
      <div class="flex items-center no-wrap q-gap-md">
        <q-btn
          icon="chevron_left"
          flat
          round
          dense
          :disable="!canGoPrev"
          @click="emit('previous')"
        />
        <div class="header-title text-h6 text-bold">
          {{ currentMonthLabel }}
        </div>
        <q-btn
          icon="chevron_right"
          flat
          round
          dense
          :disable="!canGoNext"
          @click="emit('next')"
        />
      </div>
      <q-btn icon="today" flat round dense @click="emit('today')" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentMonthLabel: string;
  canGoPrev: boolean;
  canGoNext: boolean;
}

defineProps<Props>();
const emit = defineEmits<{
  (event: 'previous'): void;
  (event: 'next'): void;
  (event: 'today'): void;
}>();
</script>

<style scoped lang="scss">
.calendar-header {
  position: sticky;
  top: 24px;
  z-index: 1;

  .header-title {
    min-width: 140px;
    text-align: center;
  }
}
</style>
