<template>
  <q-dialog v-model="isVisible" position="bottom">
    <q-card class="time-dialog">
      <q-card-section class="dialog-header">
        <div class="text-subtitle1 text-bold">{{ title }}</div>
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
        <q-time v-model="timeValue" unelevated class="full-width bg-block" />
      </q-card-section>
      <q-card-actions class="dialog-actions bg-block">
        <div class="left-actions flex q-gap-sm">
          <q-btn
            round
            class="bg-block"
            unelevated
            icon="delete"
            text-color="negative"
            @click="clearTime"
          />
          <q-btn
            round
            class="bg-block"
            icon="close"
            unelevated
            text-color="grey-6"
            @click="closeDialog"
          />
        </div>
        <q-btn label="Apply" rounded color="primary" class="q-btn-min-width" @click="confirmTime" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  modelValue: boolean;
  time: string | null;
  title: string | null;
  fieldType?: 'start' | 'end';
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm', time: string | null): void;
}

const props = withDefaults(defineProps<Props>(), {
  fieldType: 'start',
});

const emit = defineEmits<Emits>();

// Convert time from HH:mm:ss.SSS to hh:mm A format for q-time
const convertTo12HourFormat = (time: string | null): string => {
  if (!time) {
    return props.fieldType === 'start' ? '09:00 AM' : '05:00 PM';
  }

  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '';

  const hours = parseInt(match[1] ?? '0', 10);
  const minutes = match[2] ?? '00';
  const period: 'AM' | 'PM' = props.fieldType === 'start' ? 'AM' : 'PM';

  // Convert to 12-hour format
  const hours12 = hours % 12 || 12;

  return `${hours12}:${minutes} ${period}`;
};

// Convert time from hh:mm A back to HH:mm:ss.SSS format
const convertFrom12HourFormat = (time12Hour: string): string => {
  if (!time12Hour) return '';

  const match = time12Hour.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return '';

  const hours = parseInt(match[1] ?? '0', 10);
  const minutes = match[2] ?? '00';
  const period = match[3]?.toUpperCase() || (props.fieldType === 'start' ? 'AM' : 'PM');

  // Convert to 24-hour format
  let hours24: number;
  if (period === 'PM') {
    hours24 = hours === 12 ? 12 : hours + 12;
  } else {
    hours24 = hours === 12 ? 0 : hours;
  }

  return `${hours24.toString().padStart(2, '0')}:${minutes}:00.000`;
};

// Initialize timeValue when dialog opens or time prop changes
const initializeTimeValue = () => {
  const convertedTime = convertTo12HourFormat(props.time);
  timeValue.value = convertedTime;
};

const isVisible = ref(props.modelValue);
const timeValue = ref<string>('');

// Initialize timeValue on mount
if (props.modelValue) {
  initializeTimeValue();
}

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
    if (newValue) {
      // When dialog opens, initialize with correct AM/PM
      initializeTimeValue();
    }
  },
);

// Watch for external changes to time
watch(
  () => props.time,
  () => {
    if (isVisible.value) {
      // Only update if dialog is open
      initializeTimeValue();
    }
  },
);

// Watch for internal changes to isVisible
watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

const clearTime = () => {
  timeValue.value = '';
};

const closeDialog = () => {
  isVisible.value = false;
  // Reset time to original value when canceling
  initializeTimeValue();
};

const confirmTime = () => {
  if (!timeValue.value) {
    emit('confirm', null);
    isVisible.value = false;
    return;
  }

  // Convert from 12-hour format back to full time format
  const fullTime = convertFrom12HourFormat(timeValue.value);
  emit('confirm', fullTime || null);
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
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);

    .text-h6 {
      font-weight: 600;
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

    .q-btn-min-width {
      min-width: 100px;
      font-weight: 600;
    }
  }

  :deep(.q-time__header-ampm),
  :deep(.q-time__ampm) {
    display: none !important;
  }
}

.body--dark {
  .time-dialog {
    .dialog-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
