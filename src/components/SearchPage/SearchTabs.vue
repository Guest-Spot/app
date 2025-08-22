<template>
  <div class="tabs-section q-mb-lg">
    <div class="tab-container">
      <q-btn
        class="tab-btn"
        :class="{ active: modelValue === TAB_SHOPS }"
        unelevated
        rounded
        :outline="modelValue !== TAB_SHOPS"
        :color="modelValue === TAB_SHOPS ? 'dark' : 'grey-7'"
        :text-color="modelValue === TAB_SHOPS ? 'white' : 'dark'"
        label="Shops"
        @click="$emit('update:modelValue', TAB_SHOPS)"
      />
      <q-btn
        class="tab-btn"
        :class="{ active: modelValue === TAB_ARTISTS }"
        unelevated
        rounded
        :outline="modelValue !== TAB_ARTISTS"
        :color="modelValue === TAB_ARTISTS ? 'dark' : 'grey-7'"
        :text-color="modelValue === TAB_ARTISTS ? 'white' : 'dark'"
        label="Artists"
        @click="$emit('update:modelValue', TAB_ARTISTS)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const TAB_SHOPS = 'shops';
const TAB_ARTISTS = 'artists';

interface Props {
  modelValue: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<style scoped lang="scss">
.tabs-section {
  display: flex;
  justify-content: center;
}

.tab-container {
  display: flex;
  gap: 10px;
}

.tab-btn {
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  min-width: 100px;
  
  &.active {
    transform: scale(1.05);
  }
}
</style>
