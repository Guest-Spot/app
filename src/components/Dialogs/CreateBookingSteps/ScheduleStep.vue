<template>
  <div class="step-content">
    <q-form ref="formRef" class="schedule-form flex column q-gap-lg">
      <div class="input-grid">
        <div class="input-group">
          <label class="input-label">Day</label>
          <q-input
            v-model="dayModel"
            outlined
            dense
            rounded
            placeholder="Select a day"
            readonly
            :rules="[rules.required('Day')]"
            @click.stop="dateProxy?.show()"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer" @click.stop="dateProxy?.show()" />
            </template>
            <q-popup-proxy ref="dateProxy" cover transition-show="scale" transition-hide="scale">
              <q-date
                v-model="dayModel"
                mask="YYYY-MM-DD"
                class="bg-block"
                :options="isDateAllowed"
                @update:model-value="() => dateProxy?.hide()"
              />
            </q-popup-proxy>
          </q-input>
        </div>

        <div class="input-group">
          <label class="input-label">Start Time</label>
          <TimeSlotPicker
            class="time-slot-picker"
            v-model="startTimeModel"
            :times="availableTimes"
            :disabled="isTimePickerDisabled"
          >
            <template #empty>
              {{ emptyStateMessage }}
            </template>
          </TimeSlotPicker>
          <p v-if="startTimeError" class="input-error text-negative">{{ startTimeError }}</p>
        </div>
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type PropType } from 'vue';
import type { QForm } from 'quasar';
import type { IOpeningHours } from 'src/interfaces/common';
import TimeSlotPicker from './TimeSlotPicker.vue';

type Rules = {
  required: (field: string) => (val: string | null | undefined) => true | string;
};

const props = defineProps({
  day: {
    type: String,
    default: '',
  },
  openingHours: {
    type: Array as PropType<IOpeningHours[]>,
    default: () => [],
  },
  disabledDays: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  startTime: {
    type: String,
    default: '',
  },
  rules: {
    type: Object as PropType<Rules>,
    required: true,
  },
});

const emit = defineEmits<{
  (e: 'update:day', value: string): void;
  (e: 'update:startTime', value: string): void;
}>();

const formRef = ref<QForm | null>(null);
const dateProxy = ref();
const startTimeError = ref('');

const dayModel = computed({
  get: () => props.day,
  set: (val: string) => emit('update:day', val),
});

const startTimeModel = computed({
  get: () => props.startTime,
  set: (val: string) => emit('update:startTime', val),
});

type DayKey = IOpeningHours['day'];

const DAY_KEY_BY_INDEX: Record<number, DayKey> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
};

const normalizeTimeValue = (time: string | null): string | null => {
  if (!time) return null;
  const parts = time.split(':');
  if (parts.length < 2) return null;
  const hours = parts[0]?.padStart(2, '0') || null;
  const minutes = parts[1]?.padStart(2, '0') || null;
  if (!hours || !minutes) return null;
  return `${hours}:${minutes}`;
};

const normalizeDateString = (dateString: string | null | undefined): string | null => {
  if (!dateString) return null;
  const sanitized = dateString.replace(/\//g, '-').trim();
  const parts = sanitized.split('-');
  if (parts.length !== 3) return null;
  const [yearStr, monthStr, dayStr] = parts;
  const year = Number.parseInt(yearStr, 10);
  const month = Number.parseInt(monthStr, 10);
  const day = Number.parseInt(dayStr, 10);
  if ([year, month, day].some((value) => Number.isNaN(value))) {
    return null;
  }
  const jsDate = new Date(year, month - 1, day);
  if (Number.isNaN(jsDate.getTime())) {
    return null;
  }
  const normalizedMonth = String(jsDate.getMonth() + 1).padStart(2, '0');
  const normalizedDay = String(jsDate.getDate()).padStart(2, '0');
  return `${jsDate.getFullYear()}-${normalizedMonth}-${normalizedDay}`;
};

const disabledDaysSet = computed<Set<string>>(() => {
  const blockedDays = new Set<string>();
  props.disabledDays.forEach((day) => {
    const normalized = normalizeDateString(day);
    if (normalized) {
      blockedDays.add(normalized);
    }
  });
  return blockedDays;
});

// Pre-compute opening hours by weekday for quick lookups
const openingHoursMap = computed<
  Partial<Record<DayKey, { start: string | null; end: string | null }>>
>(() =>
  props.openingHours.reduce(
    (acc, entry) => {
      acc[entry.day] = {
        start: normalizeTimeValue(entry.start),
        end: normalizeTimeValue(entry.end),
      };
      return acc;
    },
    {} as Partial<Record<DayKey, { start: string | null; end: string | null }>>,
  ),
);

const hasWorkingIntervals = computed(() =>
  Object.values(openingHoursMap.value).some((entry) => entry?.start && entry?.end),
);

const parseDateToDayKey = (dateString: string): DayKey | null => {
  const normalized = normalizeDateString(dateString);
  if (!normalized) return null;
  const parts = normalized.split('-').map((part) => Number.parseInt(part, 10));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return null;
  const [year, month, day] = parts;
  const jsDate = new Date(year, month - 1, day);
  if (Number.isNaN(jsDate.getTime())) return null;
  return DAY_KEY_BY_INDEX[jsDate.getDay()] || null;
};

const selectedDayKey = computed<DayKey | null>(() => parseDateToDayKey(dayModel.value));

const hasSelectedDay = computed(() => !!selectedDayKey.value);

const selectedDayHours = computed<{ start: string; end: string } | null>(() => {
  const dayKey = selectedDayKey.value;
  if (!dayKey) return null;
  const entry = openingHoursMap.value[dayKey];
  if (!entry?.start || !entry?.end) return null;
  return {
    start: entry.start,
    end: entry.end,
  };
});

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':');
  const hoursNum = parseInt(hours ?? '0', 10);
  const minutesNum = parseInt(minutes ?? '0', 10);
  return hoursNum * 60 + minutesNum;
};

const isDateBlocked = (dateString: string): boolean => {
  const normalized = normalizeDateString(dateString);
  if (!normalized) return false;
  return disabledDaysSet.value.has(normalized);
};

const isDateAllowed = (dateString: string): boolean => {
  // Check if date is in the past
  const normalized = normalizeDateString(dateString);
  if (normalized) {
    const selectedDate = new Date(normalized);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return false;
    }
  }

  if (isDateBlocked(dateString)) {
    return false;
  }
  if (!hasWorkingIntervals.value) return true;
  const dayKey = parseDateToDayKey(dateString);
  if (!dayKey) return false;
  const entry = openingHoursMap.value[dayKey];
  return !!(entry?.start && entry?.end);
};

const formatTimeFromParts = (hour: number, minute: number): string => {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const TIME_SLOT_STEP_MINUTES = 60;

const buildTimeSlots = (start: string, end: string): string[] => {
  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);
  if (endMinutes < startMinutes) return [];

  const slots: string[] = [];
  for (let minutes = startMinutes; minutes <= endMinutes; minutes += TIME_SLOT_STEP_MINUTES) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    slots.push(formatTimeFromParts(hours, mins));
  }
  return slots;
};

const availableTimes = computed<string[]>(() => {
  const hours = selectedDayHours.value;
  if (!hours) return [];
  return buildTimeSlots(hours.start, hours.end);
});

const hasAvailableTimes = computed(() => availableTimes.value.length > 0);

const isTimePickerDisabled = computed(() => !hasSelectedDay.value || !hasAvailableTimes.value);

const emptyStateMessage = computed(() => {
  if (!hasSelectedDay.value) {
    return 'Select a day to see available slots';
  }
  if (!hasAvailableTimes.value) {
    return 'This day has no available time slots';
  }
  return '';
});

const ensureStartTimeIsValid = () => {
  const normalized = normalizeTimeValue(startTimeModel.value);
  if (isTimePickerDisabled.value) {
    if (startTimeModel.value) {
      startTimeModel.value = '';
    }
    return;
  }

  if (!hasAvailableTimes.value) {
    if (startTimeModel.value) {
      startTimeModel.value = '';
    }
    return;
  }

  if (!normalized) return;
  if (!availableTimes.value.includes(normalized)) {
    startTimeModel.value = '';
  }
};

// Keep selected time aligned with available opening hours
watch(
  () => props.disabledDays,
  () => {
    const normalizedSelectedDay = normalizeDateString(dayModel.value);
    if (normalizedSelectedDay && disabledDaysSet.value.has(normalizedSelectedDay)) {
      dayModel.value = '';
    }
  },
  { deep: true },
);

watch(
  () => props.openingHours,
  () => {
    ensureStartTimeIsValid();
  },
  { deep: true, immediate: true },
);

watch(
  () => selectedDayKey.value,
  () => {
    ensureStartTimeIsValid();
  },
  { immediate: true },
);

watch(
  () => startTimeModel.value,
  (newValue) => {
    startTimeError.value = '';
    if (!newValue) return;
    if (!hasAvailableTimes.value) {
      startTimeModel.value = '';
      return;
    }
    const normalized = normalizeTimeValue(newValue);
    if (!normalized || !availableTimes.value.includes(normalized)) {
      startTimeModel.value = '';
      return;
    }
  },
);

const validateForm = async () => {
  startTimeError.value = '';
  const formResult = await formRef.value?.validate();
  if (!formResult) return false;

  if (!isTimePickerDisabled.value && !startTimeModel.value) {
    startTimeError.value = 'Start time is required';
    return false;
  }

  return true;
};

const resetForm = () => {
  formRef.value?.resetValidation();
  formRef.value?.reset();
  dateProxy.value?.hide?.();
  startTimeError.value = '';
};

defineExpose({
  validateForm,
  resetForm,
});
</script>

<style scoped lang="scss">
.step-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 20px;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .input-label {
    font-weight: 600;
    font-size: 14px;
  }

  .time-slot-picker {
    margin-top: 4px;
  }

  .input-error {
    margin: 4px 0 0;
    font-size: 12px;
    font-weight: 600;
  }
}
</style>
