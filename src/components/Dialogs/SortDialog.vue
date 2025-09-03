<template>
  <q-dialog
    v-model="isVisible"
    position="bottom"
  >
    <q-card class="sort-dialog">
      <q-card-section class="dialog-header">
        <div class="text-subtitle1 text-bold">Sort By</div>
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
        <q-list separator>
          <q-item
            v-for="option in sortOptions"
            :key="option.value"
            clickable
            v-ripple
            @click="selectSortOption(option.value)"
            :active="sortBy === option.value"
            active-class="text-primary"
          >
            <q-item-section>
              <q-item-label>{{ option.label }}</q-item-label>
            </q-item-section>
            <q-item-section avatar v-if="sortBy === option.value">
              <q-icon :name="sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'" color="primary" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions class="dialog-actions bg-block">
        <q-btn
          label="Cancel"
          rounded
          unelevated
          class="bg-block"
          @click="closeDialog"
        />
        <q-btn
          rounded
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

<script lang="ts" setup>
import { ref, watch } from 'vue';

interface SortValue {
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';
}

interface Props {
  modelValue: boolean;
  sortValue: SortValue;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'update:sortValue', value: SortValue): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Dialog visibility
const isVisible = ref(props.modelValue);

// Sort state
const sortBy = ref<string | null>(props.sortValue.sortBy);
const sortDirection = ref<'asc' | 'desc'>(props.sortValue.sortDirection);

// Sort options
const sortOptions = [
  { label: 'Most Popular', value: 'popularity' },
  { label: 'Highest Rated', value: 'rating' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Newest', value: 'date' }
];

// Watch for props changes
watch(() => props.modelValue, (newValue) => {
  isVisible.value = newValue;
});

watch(() => props.sortValue, (newValue) => {
  sortBy.value = newValue.sortBy;
  sortDirection.value = newValue.sortDirection;
}, { deep: true });

// Watch for internal changes to isVisible
watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

const selectSortOption = (value: string) => {
  if (sortBy.value === value) {
    // Toggle direction if same option is selected
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Set new sort option
    sortBy.value = value;

    // Set default direction based on the option
    if (value === 'price_asc') {
      sortDirection.value = 'asc';
    } else if (value === 'price_desc') {
      sortDirection.value = 'desc';
    } else {
      sortDirection.value = 'desc'; // Default for other options
    }
  }

  emit('update:sortValue', {
    sortBy: sortBy.value,
    sortDirection: sortDirection.value
  });
};

const closeDialog = () => {
  isVisible.value = false;
};
</script>

<style scoped lang="scss">
.sort-dialog {
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
  .sort-dialog {
    .dialog-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
