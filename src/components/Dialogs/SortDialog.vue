<template>
  <q-dialog v-model="isVisible" no-route-dismiss position="bottom">
    <q-card class="sort-dialog">
      <q-card-section class="dialog-header">
        <div class="text-subtitle1 text-bold">Sort By</div>
        <q-btn
          icon="close"
          class="bg-block"
          text-color="primary"
          round
          dense
          @click="closeDialog"
        />
      </q-card-section>

      <q-card-section class="dialog-content">
        <q-list class="flex column q-gap-sm">
          <q-item
            v-for="option in sortOptions"
            :key="option.value"
            clickable
            rounded
            dense
            v-ripple
            @click="selectSortOption(option.value)"
            class="bg-block border-radius-lg q-pl-sm q-pr-none"
          >
            <q-item-section avatar>
              <q-radio v-model="sortBy" :val="option.value" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ option.label }}</q-item-label>
            </q-item-section>
            <q-item-section avatar v-if="sortBy === option.value">
              <q-avatar class="bg-block">
                <q-icon
                  :name="sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'"
                  :color="sortBy === option.value ? 'primary' : 'grey-9'"
                />
              </q-avatar>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions class="dialog-actions bg-block">
        <q-btn
          color="grey-9"
          label="Clear All"
          rounded
          unelevated
          class="bg-block min-width"
          @click="clearSort"
        />
        <q-btn rounded color="primary" class="min-width" @click="applySort">
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
import { useRouter, useRoute } from 'vue-router';

interface SortValue {
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';
}

interface Props {
  modelValue: boolean;
  sortValue: SortValue;
  noRouteReplace?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'update:sortValue', value: SortValue): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const router = useRouter();
const route = useRoute();

// Dialog visibility
const isVisible = ref(props.modelValue);

// Sort state
const sortBy = ref<string | null>(props.sortValue.sortBy);
const sortDirection = ref<'asc' | 'desc'>(props.sortValue.sortDirection);

// Sort options
const sortOptions = [{ label: 'Name: A to Z', value: 'name' }];

// Watch for props changes
watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
  },
);

watch(
  () => props.sortValue,
  (newValue) => {
    sortBy.value = newValue.sortBy;
    sortDirection.value = newValue.sortDirection;
  },
  { deep: true },
);

// Watch for internal changes to isVisible
watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

const saveSortToUrl = (sortBy: string, sortDirection: string) => {
  if (props.noRouteReplace) return;
  const queryParams = {
    ...(sortBy && sortDirection ? { sort: `${sortBy}:${sortDirection}` } : { sort: null }),
  };
  void router.replace({ query: { ...route.query, ...queryParams } });
};

const selectSortOption = (value: string) => {
  if (sortBy.value !== value) {
    sortBy.value = value;
  }
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  saveSortToUrl(sortBy.value || '', sortDirection.value);
  emit('update:sortValue', {
    sortBy: sortBy.value,
    sortDirection: sortDirection.value,
  });
};

const closeDialog = () => {
  isVisible.value = false;
};

const applySort = () => {
  closeDialog();
};

const clearSort = () => {
  sortBy.value = null;
  sortDirection.value = 'asc';
  saveSortToUrl(sortBy.value || '', sortDirection.value);
  emit('update:sortValue', {
    sortBy: sortBy.value,
    sortDirection: sortDirection.value,
  });
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
      font-weight: 600;
    }

    .min-width {
      min-width: 100px;
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
