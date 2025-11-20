<template>
  <div class="input-group">
    <label class="input-label">Styles</label>
    <q-select
      v-model="internalValue"
      :options="filteredOptions"
      multiple
      use-chips
      outlined
      dense
      rounded
      use-input
      input-debounce="0"
      @filter="filterFn"
      option-label="name"
      option-value="name"
      emit-value
      map-options
      placeholder="Select styles"
      class="custom-input"
      :loading="loading"
      behavior="menu"
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">
            No results
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import { TATTOO_STYLES_QUERY } from 'src/apollo/types/tattoo';
import type { ITattooData, ITattooStyle } from 'src/interfaces/tattoo';

defineOptions({
  name: 'StyleSelector',
});

const props = defineProps<{
  modelValue: string[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const options = ref<ITattooStyle[]>([]);
const filteredOptions = ref<ITattooStyle[]>([]);

const { result, loading } = useQuery<ITattooData>(TATTOO_STYLES_QUERY);

watch(result, (val) => {
  if (val?.tattoo?.styles) {
    options.value = val.tattoo.styles;
    filteredOptions.value = val.tattoo.styles;
  }
});

const filterFn = (val: string, update: (callback: () => void) => void) => {
  if (val === '') {
    update(() => {
      filteredOptions.value = options.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    filteredOptions.value = options.value.filter(
      (v) => v.name.toLowerCase().indexOf(needle) > -1
    );
  });
};
</script>

<style scoped lang="scss">
.input-group {
  margin-bottom: 20px;

  .input-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    font-size: 14px;
  }

  .custom-input {
    width: 100%;
  }
}
</style>

