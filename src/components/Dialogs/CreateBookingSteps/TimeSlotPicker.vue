<template>
  <div class="time-slot-picker" :class="{ 'time-slot-picker--disabled': disabled }">
    <div v-if="!disabled && times.length" class="flex flex-wrap q-gap-sm">
      <button
        v-for="time in times"
        :key="time"
        type="button"
        class="time-slot-picker__item bg-block"
        :class="{ 'time-slot-picker__item--active': time === modelValue }"
        @click="onSelect(time)"
      >
        <span class="time-slot-picker__label">{{ formatDisplay(time) }}</span>
      </button>
    </div>
    <div v-else class="time-slot-picker__empty text-grey-6">
      <slot name="empty">
        {{ disabled ? 'Select a day first' : 'No available time slots' }}
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  times: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'select', value: string): void;
}>();

const periodFormatter = (time: string): string => {
  const [hoursString = '0', minutesString = '00'] = time.split(':');
  const hours = parseInt(hoursString, 10);
  const minutes = minutesString.padStart(2, '0');
  if (Number.isNaN(hours)) return time;

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${displayHours}${minutes !== '00' ? `:${minutes}` : ''} ${period}`;
};

const onSelect = (time: string) => {
  if (props.disabled) return;
  emit('update:modelValue', time);
  emit('select', time);
};

const formatDisplay = (time: string) => periodFormatter(time);
</script>

<style scoped lang="scss">
.time-slot-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 260px;
  max-width: 100%;

  &__item {
    flex: 0 0 auto;
    width: calc(25% - 6px);
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    color: var(--q-text-primary);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      background 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    }

    &--active {
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
      background: var(--q-primary);
    }
  }

  &__label {
    font-weight: 600;
    font-size: 14px;
    color: inherit;
  }

  &__empty {
    font-size: 13px;
    text-align: center;
  }

  &--disabled {
    opacity: 0.6;
    pointer-events: none;
  }
}
</style>
