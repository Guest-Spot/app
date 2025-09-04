<template>
  <div class="search-header">
    <ListHeader
      :title="title"
      class="q-mb-md"
    >
      <div class="flex q-gap-sm">
        <q-btn
          icon="search"
          class="bg-block"
          :text-color="modelValue ? 'primary' : ''"
          round
          dense
          @click="$emit('toggle-search')"
        />
        <q-btn
          icon="filter_list"
          class="bg-block"
          :text-color="hasFilters ? 'primary' : ''"
          round
          dense
          @click="$emit('toggle-filters')"
        />
        <q-btn
          icon="sort"
          class="bg-block"
          :text-color="hasSort ? 'primary' : ''"
          round
          dense
          @click="$emit('toggle-sort')"
        />
      </div>
    </ListHeader>
  </div>
</template>

<script setup lang="ts">
import { ListHeader } from 'src/components';

interface Props {
  modelValue: string | null;
  title: string;
  hasFilters: boolean;
  hasSort: boolean;
}

interface Emits {
  (e: 'toggle-search'): void;
  (e: 'toggle-filters'): void;
  (e: 'toggle-sort'): void;
  (e: 'update:modelValue', value: string): void;
}

defineEmits<Emits>();
defineProps<Props>();
</script>

<style lang="scss" scoped>
</style>
