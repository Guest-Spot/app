<template>
  <q-dialog
    v-model="isVisible"
    position="bottom"
  >
    <q-card class="filter-dialog">
      <q-card-section class="dialog-header">
        <div class="text-subtitle1 text-bold">Filters</div>
        <q-btn
          icon="close"
          class="bg-block"
          text-color="primary"
          round
          dense
          size="sm"
          @click="closeDialog"
        />
      </q-card-section>

      <q-card-section class="dialog-content">
        <div class="flex column q-gap-md">
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
      </q-card-section>

      <q-card-actions class="dialog-actions bg-block">
        <q-btn
          color="grey-6"
          label="Clear All"
          flat
          @click="clearFilters"
          rounded
          unelevated
          class="bg-block"
        />
        <q-btn
          rounded
          unelevated
          color="primary"
          @click="closeDialog"
        >
          <div class="q-px-md">
            <span class="text-body2">Apply</span>
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';

export default defineComponent({
  name: 'FilterDialog',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    filterValue: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue', 'update:filterValue'],
  setup(props, { emit }) {
    interface Filters {
      location: string | null;
      category: string | null;
      rating: string | null;
      priceRange: string | null;
    }

    // Dialog visibility
    const isVisible = ref(props.modelValue);

    // Filters state
    const filters = ref<Filters>({ ...props.filterValue as Filters });

    // Watch for props changes
    watch(() => props.modelValue, (newValue) => {
      isVisible.value = newValue;
    });

    watch(() => props.filterValue, (newValue) => {
      filters.value = { ...newValue as Filters };
    }, { deep: true });

    // Watch for internal changes to isVisible
    watch(isVisible, (newValue) => {
      emit('update:modelValue', newValue);
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

    const applyFilters = () => {
      emit('update:filterValue', filters.value);
    };

    const clearFilters = () => {
      filters.value = {
        location: null,
        category: null,
        rating: null,
        priceRange: null
      };
      emit('update:filterValue', filters.value);
    };

    const closeDialog = () => {
      isVisible.value = false;
    };

    return {
      isVisible,
      filters,
      locationOptions,
      ratingOptions,
      priceRangeOptions,
      hasActiveFilters,
      applyFilters,
      clearFilters,
      closeDialog
    };
  }
});
</script>

<style scoped lang="scss">
.filter-dialog {
  border-radius: 20px 20px 0 0;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 10px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);

    .text-subtitle1 {
      font-weight: 600;
    }
  }

  .dialog-content {
    padding: 20px;

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filter-label {
      font-size: 14px;
      font-weight: 600;
    }
  }

  .dialog-actions {
    padding: 16px 20px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    bottom: 0;
    z-index: 10;

    .q-btn {
      min-width: 100px;
      font-weight: 600;
    }
  }
}

.body--dark {
  .filter-dialog {
    .dialog-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
