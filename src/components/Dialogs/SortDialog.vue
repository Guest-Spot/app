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
            :clickable="!option.disabled"
            rounded
            dense
            v-ripple="!option.disabled"
            @click="selectSortOption(option)"
            :class="[
              'bg-block border-radius-lg q-pl-sm q-pr-none',
              { 'text-grey-6': option.disabled },
            ]"
          >
            <q-item-section avatar>
              <q-radio v-model="sortBy" :val="option.value" :disable="option.disabled" />
            </q-item-section>
            <q-item-section>
              <q-item-label :class="{ 'text-grey-6': option.disabled }">{{ option.label }}</q-item-label>
              <div v-if="option.hint" class="text-caption text-grey-6 flex items-center q-gap-xs">
                <q-btn
                  v-if="option.linkTo"
                  flat
                  dense
                  no-caps
                  class="q-pa-none text-caption"
                  color="white"
                  :to="option.linkTo"
                  :label="option.hint"
                  :ripple="false"
                  @click.stop
                />
                <q-btn
                  v-if="option.linkTo"
                  flat
                  dense
                  round
                  class="q-pa-none absolute-right q-mr-sm"
                  color="primary"
                  icon="arrow_right"
                  :to="option.linkTo"
                  :ripple="false"
                  @click.stop
                />
                <span v-else>{{ option.hint }}</span>
              </div>
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
            <span class="text-body2">Done</span>
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from 'src/stores/user';
import { useTokens } from 'src/modules/useTokens';
import { hasUserAddress } from 'src/utils/address';

interface SortValue {
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';
}

interface SortOption {
  label: string;
  value: string;
  disabled?: boolean;
  hint?: string;
  linkTo?: string;
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
const userStore = useUserStore();
const { isAuthenticated: hasValidSession } = useTokens();

const isAuthorized = computed(() => userStore.getIsAuthenticated || hasValidSession());
const isDistanceSortDisabled = computed(() => {
  if (!isAuthorized.value) return false;
  if (!userStore.getUser) return false;
  return !hasUserAddress(userStore.getUser);
});
const canUseDistanceSort = computed(() => isAuthorized.value && !isDistanceSortDisabled.value);

// Dialog visibility
const isVisible = ref(props.modelValue);

// Sort state
const sortBy = ref<string | null>(props.sortValue.sortBy);
const sortDirection = ref<'asc' | 'desc'>(props.sortValue.sortDirection);

// Sort options
const allSortOptions: SortOption[] = [
  { label: 'Distance', value: 'distance' },
  { label: 'Name: A to Z', value: 'name' },
  { label: 'Date Created', value: 'createdAt' },
  { label: 'Last Updated', value: 'updatedAt' },
];
const distanceSortHint = 'Add address to use distance';
const sortOptions = computed<SortOption[]>(() => {
  if (!isAuthorized.value) {
    return allSortOptions.filter((option) => option.value !== 'distance');
  }

  return allSortOptions.map((option) => {
    if (option.value !== 'distance' || !isDistanceSortDisabled.value) {
      return option;
    }
    return {
      ...option,
      disabled: true,
      hint: distanceSortHint,
      linkTo: '/profile/location',
    };
  });
});

// Watch for props changes
watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
  },
);

const saveSortToUrl = (sortBy: string, sortDirection: string) => {
  if (props.noRouteReplace) return;
  const queryParams = {
    ...(sortBy && sortDirection ? { sort: `${sortBy}:${sortDirection}` } : { sort: null }),
  };
  void router.replace({ query: { ...route.query, ...queryParams } });
};

const ensureAvailableSort = () => {
  if (canUseDistanceSort.value) return;
  if (sortBy.value && sortBy.value !== 'distance') return;

  const fallbackSortBy = 'createdAt';
  const fallbackSortDirection = 'desc';
  if (sortBy.value === fallbackSortBy && sortDirection.value === fallbackSortDirection) return;

  sortBy.value = fallbackSortBy;
  sortDirection.value = fallbackSortDirection;
  saveSortToUrl(fallbackSortBy, fallbackSortDirection);
  emit('update:sortValue', {
    sortBy: fallbackSortBy,
    sortDirection: fallbackSortDirection,
  });
};

watch(
  () => props.sortValue,
  (newValue) => {
    sortBy.value = newValue.sortBy;
    sortDirection.value = newValue.sortDirection;
    ensureAvailableSort();
  },
  { deep: true, immediate: true },
);

watch(canUseDistanceSort, (canUse) => {
  if (!canUse) {
    ensureAvailableSort();
  }
});

// Watch for internal changes to isVisible
watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

const selectSortOption = (option: SortOption) => {
  if (option.disabled) return;
  const value = option.value;
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
  const fallbackSort: SortValue = canUseDistanceSort.value
    ? { sortBy: 'distance', sortDirection: 'asc' }
    : { sortBy: 'createdAt', sortDirection: 'desc' };
  sortBy.value = fallbackSort.sortBy;
  sortDirection.value = fallbackSort.sortDirection;
  saveSortToUrl(fallbackSort.sortBy || '', fallbackSort.sortDirection);
  emit('update:sortValue', fallbackSort);
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
