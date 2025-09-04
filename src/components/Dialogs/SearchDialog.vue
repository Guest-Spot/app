<template>
  <q-dialog
    v-model="isVisible"
    position="top"
    full-width
    full-height
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card class="search-dialog bg-block">
      <q-card-section class="row items-center q-pb-none">
        <div class="col search-input-container">
          <q-input
            v-model="searchQuery"
            outlined
            dense
            placeholder="Search by name"
            class="full-width"
            autofocus
            debounce="500"
            clearable
            rounded
            @update:model-value="handleSearch"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <q-btn
          icon="close"
          flat
          round
          dense
          class="q-ml-sm bg-block"
          @click="closeSearch"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

interface Props {
  modelValue: boolean;
  query: string | null;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'update:query', value: string): void;
}

const emit = defineEmits<Emits>();
const props = defineProps<Props>();

const router = useRouter();
const route = useRoute();

// Dialog visibility
const isVisible = ref(props.modelValue);
const searchQuery = ref(props.query);

// Watch for props changes
watch(() => props.modelValue, (newValue) => {
  isVisible.value = newValue;
});

watch(() => props.query, (newValue) => {
  searchQuery.value = newValue;
});

// Watch for internal changes to isVisible
watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

function handleSearch() {
  const trimmedQuery = searchQuery.value?.trim() || '';
  emit('update:query', trimmedQuery);
  void router.replace({ query: { ...route.query, search: trimmedQuery }});
}

function closeSearch() {
  isVisible.value = false;
}
</script>

<style lang="scss" scoped>
.search-dialog {
  background-color: var(--q-primary-lighten);
  height: auto;
  border-radius: 0 0 16px 16px;

  .search-input-container {
    padding: 8px 0;
  }
}
</style>
