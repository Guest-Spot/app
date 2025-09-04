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
          :text-color="searchQuery ? 'primary' : ''"
          round
          dense
          @click="showSearch = true"
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

    <q-dialog
      v-model="showSearch"
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
              placeholder="Search by name or location"
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
  </div>
</template>

<script setup lang="ts">
import { ListHeader } from 'src/components';
import { ref } from 'vue';

interface Props {
  title: string;
  hasFilters: boolean;
  hasSort: boolean;
}

interface Emits {
  (e: 'toggle-search'): void;
  (e: 'toggle-filters'): void;
  (e: 'toggle-sort'): void;
  (e: 'search', query: string): void;
}

const emit = defineEmits<Emits>();
defineProps<Props>();

const showSearch = ref(false);
const searchQuery = ref('');

function handleSearch() {
  emit('search', searchQuery.value?.trim() || '');
}

function closeSearch() {
  showSearch.value = false;
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
