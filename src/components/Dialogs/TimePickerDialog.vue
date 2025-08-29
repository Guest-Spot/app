<template>
  <q-dialog
    v-model="isVisible"
    position="bottom"
  >
    <q-card class="time-dialog">
      <q-card-section class="dialog-header">
        <div class="text-subtitle1 text-bold">{{ title }}</div>
        <q-btn
          icon="close"
          color="dark"
          round
          dense
          size="sm"
          @click="closeDialog"
        />
      </q-card-section>
      <q-card-section class="dialog-content">
        <q-time
          v-model="timeValue"
          format24h
          color="dark"
          class="full-width"
        />
      </q-card-section>
      <q-card-actions class="dialog-actions">
        <q-btn
          label="Отмена"
          rounded
          color="grey-6"
          @click="closeDialog"
        />
        <q-btn
          label="Готово"
          rounded
          color="dark"
          @click="confirmTime"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  modelValue: boolean;
  time: string;
  title: string;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm', time: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isVisible = ref(props.modelValue);
const timeValue = ref(props.time);

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  isVisible.value = newValue;
});

// Watch for external changes to time
watch(() => props.time, (newValue) => {
  timeValue.value = newValue;
});

// Watch for internal changes to isVisible
watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

const closeDialog = () => {
  isVisible.value = false;
  // Reset time to original value when canceling
  timeValue.value = props.time;
};

const confirmTime = () => {
  emit('confirm', timeValue.value);
  isVisible.value = false;
};
</script>

<style scoped lang="scss">
.time-dialog {
  border-radius: 20px 20px 0 0;
  min-height: 400px;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 10px;
    border-bottom: 1px solid var(--border-light);

    .text-h6 {
      font-weight: 600;
      color: var(--brand-dark);
    }
  }

  .dialog-content {
    padding: 20px;
    display: flex;
    justify-content: center;

    .q-time {
      max-width: 300px;
    }
  }

  .dialog-actions {
    padding: 16px 20px 32px;
    justify-content: space-between;

    .q-btn {
      min-width: 100px;
      font-weight: 600;
    }
  }
}
</style>
