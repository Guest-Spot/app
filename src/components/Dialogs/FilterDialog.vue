<template>
  <q-dialog v-model="isVisible" no-route-dismiss position="bottom">
    <q-card class="filter-dialog">
      <q-card-section class="dialog-header">
        <div class="text-subtitle1 text-bold">Filters</div>
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
        <div class="flex column q-gap-md">
          <!-- Location Filter -->
          <div class="filter-group">
            <label class="filter-label">City</label>
            <q-select
              v-model="filters.city"
              :options="cities"
              outlined
              dense
              rounded
              menu-anchor="top left"
              menu-self="bottom left"
              :use-input="!filters.city"
              @filter="filterCities"
              placeholder="Select city"
              class="filter-select"
              clearable
              @update:model-value="onChangeFilters"
            >
              <template v-slot:prepend>
                <q-icon name="location_on" />
              </template>
            </q-select>
          </div>

          <!-- Styles Filter -->
          <div class="filter-group">
            <label class="filter-label">Styles</label>
            <q-select
              v-model="filters.styles"
              :options="styleOptions"
              multiple
              use-chips
              outlined
              dense
              rounded
              menu-anchor="top left"
              menu-self="bottom left"
              use-input
              @filter="filterStyles"
              placeholder="Select styles"
              class="filter-select"
              clearable
              @update:model-value="onChangeFilters"
            >
              <template v-slot:prepend>
                <q-icon name="palette" />
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="dialog-actions bg-block">
        <q-btn
          color="grey-9"
          label="Clear All"
          @click="clearFilters"
          rounded
          unelevated
          class="bg-block"
        />
        <q-btn rounded unelevated color="primary" @click="applyFilters">
          <div class="q-px-md">
            <span class="text-body2">Apply</span>
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, type PropType } from 'vue';
import type { IFilters } from 'src/interfaces/filters';
import { useRouter, useRoute } from 'vue-router';
import { useCitiesStore } from 'src/stores/cities';
import useTattooStyles from 'src/modules/useTattooStyles';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  filterValue: {
    type: Object as PropType<IFilters>,
    required: true,
  },
  noRouteReplace: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'update:filterValue', 'clearFilters']);

const citiesStore = useCitiesStore();
const { styles: tattooStyles, fetchStyles } = useTattooStyles();
const router = useRouter();
const route = useRoute();

const cities = ref(citiesStore.getCities);
const styleOptions = ref<string[]>([]);
const allStyleNames = ref<string[]>([]);

// Dialog visibility
const isVisible = ref(props.modelValue);

// Filters state
const filters = ref<IFilters>({ ...props.filterValue });

onMounted(() => {
  void fetchStyles();
});

watch(
  tattooStyles,
  (newStyles) => {
    const names = newStyles.map((s) => s.name);
    allStyleNames.value = names;
    styleOptions.value = names;
  },
  { immediate: true }
);

// Watch for props changes
watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
  },
);

watch(
  () => props.filterValue,
  (newValue) => {
    filters.value = { ...newValue };
  },
  { deep: true },
);

// Watch for internal changes to isVisible
watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

const filterCities = (val: string, update: (value: () => void) => void) => {
  update(() => {
    const needle = val.toLocaleLowerCase();
    cities.value = citiesStore.getCities.filter((v) => v.toLocaleLowerCase().indexOf(needle) > -1);
  });
};

const filterStyles = (val: string, update: (value: () => void) => void) => {
  update(() => {
    const needle = val.toLocaleLowerCase();
    styleOptions.value = allStyleNames.value.filter(
      (v) => v.toLocaleLowerCase().indexOf(needle) > -1
    );
  });
};

const onChangeFilters = () => {
  if (!props.noRouteReplace) {
    void router.replace({ query: { ...route.query, ...filters.value } });
  }
  emit('update:filterValue', filters.value);
};

const applyFilters = () => {
  closeDialog();
};

const clearFilters = () => {
  filters.value = {
    ...filters.value,
    city: null,
    styles: null,
  };
  if (!props.noRouteReplace) {
    void router.replace({ query: { ...route.query, ...filters.value } });
  }
  emit('update:filterValue', filters.value);
};

const closeDialog = () => {
  isVisible.value = false;
};
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
