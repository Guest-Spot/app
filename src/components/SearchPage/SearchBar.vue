<template>
  <div class="search-section q-mb-lg">
    <div class="search-container">
      <q-input
        :model-value="modelValue"
        outlined
        rounded
        dense
        placeholder="Search for shops or artists"
        class="search-input"
        bg-color="white"
        clearable
        @update:model-value="onUpdateModelValue"
      >
        <template v-slot:prepend>
          <q-icon name="search" color="grey-6" />
        </template>
        <template v-slot:append>
          <q-btn
            round
            flat
            dense
            icon="filter_list"
            color="grey-6"
            @click="$emit('toggleFilters')"
          />
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'toggleFilters'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const onUpdateModelValue = (value: string | number | null) => {
  emit('update:modelValue', value as string);
};
</script>

<style scoped lang="scss">
.search-section {
  display: flex;
  justify-content: center;
}

.search-container {
  width: 100%;
  max-width: 400px;
}
</style>
