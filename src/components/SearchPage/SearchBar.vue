<template>
  <div class="search-section">
    <div class="search-container full-width">
      <q-input
        :model-value="modelValue"
        outlined
        rounded
        dense
        placeholder="Search for shops or artists"
        class="bg-block border-radius-lg"
        clearable
        :disable="disable"
        @update:model-value="onUpdateModelValue"
      >
        <template v-slot:prepend>
          <q-icon name="search" color="grey-6" />
        </template>
        <template v-slot:append>
          <!-- Filter button removed, now using separate component -->
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string;
  disable?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
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
</style>
