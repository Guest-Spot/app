<template>
  <div class="search-section">
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
            :icon="hasActiveFilters ? 'filter_alt' : 'tune'"
            :color="hasActiveFilters ? 'primary' : 'grey-6'"
          >
            <q-menu 
              v-model="showMenu"
              anchor="bottom right"
              self="top right"
              class="filters-menu"
              :offset="[0, -10]"
            >
              <div class="filters-content">
                <div class="filters-header">
                  <h6 class="filters-title">Filters</h6>
                  <q-btn
                    round
                    dense
                    icon="close"
                    size="sm"
                    color="dark"
                    @click="showMenu = false"
                  />
                </div>

                <div class="flex column q-gap-md q-pa-md">
                  <!-- Location Filter -->
                  <div class="filter-group">
                    <label class="filter-label">Location</label>
                    <q-select
                      v-model="filters.location"
                      :options="locationOptions"
                      outlined
                      dense
                      rounded
                      placeholder="Select location"
                      class="filter-select"
                      clearable
                      @update:model-value="applyFilters"
                    />
                  </div>

                  <!-- Category Filter -->
                  <div class="filter-group">
                    <label class="filter-label">Category</label>
                    <q-select
                      v-model="filters.category"
                      :options="categoryOptions"
                      outlined
                      dense
                      rounded
                      placeholder="Select category"
                      class="filter-select"
                      clearable
                      @update:model-value="applyFilters"
                    />
                  </div>

                  <!-- Rating Filter -->
                  <div class="filter-group">
                    <label class="filter-label">Rating</label>
                    <q-select
                      v-model="filters.rating"
                      :options="ratingOptions"
                      outlined
                      dense
                      rounded
                      placeholder="Select rating"
                      class="filter-select"
                      clearable
                      @update:model-value="applyFilters"
                    />
                  </div>

                  <!-- Price Range Filter -->
                  <div class="filter-group">
                    <label class="filter-label">Price Range</label>
                    <q-select
                      v-model="filters.priceRange"
                      :options="priceRangeOptions"
                      outlined
                      dense
                      rounded
                      placeholder="Select price range"
                      class="filter-select"
                      clearable
                      @update:model-value="applyFilters"
                    />
                  </div>
                </div>

                <div class="filters-actions flex items-center q-px-md q-pb-md">
                  <q-btn
                    color="grey-6"
                    label="Clear All"
                    flat
                    @click="clearFilters"
                    rounded
                    class="clear-btn"
                  />
                </div>
              </div>
            </q-menu>
          </q-btn>
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Filters {
  location: string | null;
  category: string | null;
  rating: string | null;
  priceRange: string | null;
}

interface Props {
  modelValue: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'update:filters', filters: Filters): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

// Menu state
const showMenu = ref(false);

// Filters state
const filters = ref<Filters>({
  location: null,
  category: null,
  rating: null,
  priceRange: null
});

// Filter options
const locationOptions = [
  'Downtown, NY',
  'Brooklyn, NY', 
  'Manhattan, NY',
  'Queens, NY',
  'Bronx, NY',
  'Staten Island, NY'
];

const categoryOptions = [
  'Traditional Tattoo',
  'Japanese Traditional',
  'Black & Grey',
  'Color Tattoo',
  'Realistic',
  'Geometric',
  'Watercolor',
  'Tribal',
  'Neo-traditional',
  'Minimalist'
];

const ratingOptions = [
  '5 stars',
  '4+ stars',
  '3+ stars',
  '2+ stars'
];

const priceRangeOptions = [
  'Under $100',
  '$100 - $200',
  '$200 - $300',
  '$300 - $500',
  'Over $500'
];

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(filter => filter !== null);
});

// Watch for filter changes and emit updates
watch(filters, (newFilters) => {
  emit('update:filters', newFilters);
}, { deep: true });

const onUpdateModelValue = (value: string | number | null) => {
  emit('update:modelValue', value as string);
};

const applyFilters = () => {
  emit('update:filters', filters.value);
};

const clearFilters = () => {
  filters.value = {
    location: null,
    category: null,
    rating: null,
    priceRange: null
  };
  emit('update:filters', filters.value);
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

.filters-content {
  background: white;
  border-radius: 16px;
  min-width: 300px;
  max-width: 400px;
  overflow: hidden;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--divider-light);
}

.filters-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--brand-dark);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--brand-dark);
}

.clear-btn {
  font-weight: 500;
  text-transform: none;
  flex: 1;
}

.apply-btn {
  font-weight: 600;
  text-transform: none;
  flex: 1;
}
</style>
