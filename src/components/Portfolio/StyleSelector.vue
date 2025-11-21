<template>
  <div class="input-group bg-block border-radius-lg">
    <div class="flex items-center justify-between q-gap-sm full-width bg-block q-pa-md">
      <label class="input-label">Styles</label>
      <q-btn
        outline
        rounded
        color="primary"
        icon="add"
        label="Add Style"
        @click="dialogOpen = true"
        class="add-btn"
        dense
        no-caps
      />
    </div>

    <div class="styles-container q-pa-md">
      <template v-if="modelValue.length > 0">
        <q-chip
          v-for="style in modelValue"
          :key="style"
          removable
          @remove="removeStyle(style)"
          color="primary"
          text-color="white"
          class="style-chip"
        >
          {{ getStyleName(style) }}
        </q-chip>
      </template>
      <div v-else class="flex items-center q-gap-sm">
        <span class="text-caption text-grey-6">No styles selected</span>
      </div>
    </div>

    <q-dialog v-model="dialogOpen" position="bottom" maximized class="style-selector-dialog">
      <q-card class="style-dialog">
        <q-card-section class="dialog-header">
          <div class="text-subtitle1 text-bold">Select Styles</div>
          <q-btn
            icon="close"
            class="bg-block"
            text-color="primary"
            round
            dense
            size="sm"
            v-close-popup
          />
        </q-card-section>

        <div class="dialog-search q-px-md q-mt-md">
          <q-input
            v-model="searchQuery"
            dense
            outlined
            rounded
            placeholder="Search styles..."
            class="search-input"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <q-card-section class="dialog-content scroll">
          <div v-if="loading" class="text-center q-pa-md">
            <q-spinner color="primary" size="2em" />
          </div>
          <q-list v-else class="flex column q-gap-sm">
            <q-item
              v-for="style in filteredOptions"
              :key="style.name"
              tag="label"
              class="bg-block border-radius-lg full-width"
              clickable
              dense
              v-ripple
            >
              <q-item-section avatar>
                <q-checkbox v-model="internalSelected" :val="style.documentId" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ style.name }}</q-item-label>
              </q-item-section>
            </q-item>

            <div
              v-if="filteredOptions.length === 0"
              class="text-center text-grey q-pa-md"
            >
              No styles found
            </div>
          </q-list>
        </q-card-section>

        <q-card-actions class="dialog-actions bg-block">
          <q-btn
            label="Done"
            color="primary"
            rounded
            unelevated
            class="full-width"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import useTattooStyles from 'src/modules/useTattooStyles';

defineOptions({
  name: 'StyleSelector',
});

const props = defineProps<{
  modelValue: string[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const dialogOpen = ref(false);
const searchQuery = ref('');

const { styles: options, isLoading: loading } = useTattooStyles();

const internalSelected = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const filteredOptions = computed(() => {
  if (!searchQuery.value) return options.value;
  const needle = searchQuery.value.toLowerCase();
  return options.value.filter((v) =>
    v.name.toLowerCase().includes(needle)
  );
});

const removeStyle = (style: string) => {
  const newValue = props.modelValue.filter((s) => s !== style);
  emit('update:modelValue', newValue);
};

const getStyleName = (id: string) => {
  const found = options.value.find((s) => s.documentId === id);
  return found ? found.name : id;
};
</script>

<style scoped lang="scss">
.input-group {
  overflow: hidden;

  .input-label {
    display: block;
    font-weight: 500;
    font-size: 14px;
  }
}

.styles-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  min-height: 40px;
}

.add-btn {
  padding: 4px 12px;
}

.style-dialog {
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  width: 100%;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 10px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    flex-shrink: 0;

    .text-subtitle1 {
      font-weight: 600;
    }
  }

  .dialog-search {
    flex-shrink: 0;
  }

  .dialog-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }

  .dialog-actions {
    padding: 16px 20px 32px;
    display: flex;
    align-items: center;
    position: sticky;
    bottom: 0;
    z-index: 10;
    border-top: 1px solid rgba(0, 0, 0, 0.05);

    .q-btn {
      font-weight: 600;
    }
  }
}

.body--dark {
  .style-dialog {
    .dialog-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
