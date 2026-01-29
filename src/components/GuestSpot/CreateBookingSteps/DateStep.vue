<template>
  <div class="step-content">
    <q-form ref="formRef" class="date-form flex column items-center q-gap-lg">
      <div class="input-group">
        <div v-if="slotData && date" class="availability-info bg-block border-radius-lg">
          <div v-if="availabilityLoading" class="availability-loading flex items-center q-gap-sm">
            <q-spinner size="20px" color="primary" />
            <span class="text-body2 text-weight-medium">Checking availability…</span>
          </div>
          <template v-else-if="availabilityResult !== null">
            <q-banner v-if="availabilityResult.available === 0" class="availability-none rounded-borders">
              <template #avatar>
                <q-icon name="event_busy" color="warning" size="24px" />
              </template>
              No spots left for this date
            </q-banner>
            <div v-else class="availability-spots bg-block">
              <q-icon name="event_available" size="20px" color="primary" class="q-mr-sm" />
              <span class="availability-spots__text">
                {{ availabilityResult.available }} of {{ availabilityResult.total }} spots available
              </span>
            </div>
          </template>
        </div>
        <q-date
          v-model="dateModel"
          mask="YYYY-MM-DD"
          class="date-picker-inline bg-block border-radius-md"
          :options="isDateAllowed"
        />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type PropType } from 'vue';
import type { QForm } from 'quasar';
import type { IOpeningHours } from 'src/interfaces/common';
import type { IGuestSpotSlot } from 'src/interfaces/guestSpot';
import useGuestSpot from 'src/composables/useGuestSpot';

type Rules = {
  required: (field: string) => (val: string | null | undefined) => true | string;
};

interface AvailabilityResult {
  available: number;
  total: number;
  taken: number;
}

const props = defineProps({
  date: {
    type: String,
    default: '',
  },
  openingHours: {
    type: Array as PropType<IOpeningHours[]>,
    default: () => [],
  },
  slotData: {
    type: Object as PropType<IGuestSpotSlot | null>,
    default: null,
  },
  rules: {
    type: Object as PropType<Rules>,
    required: true,
  },
});

const emit = defineEmits<{
  (e: 'update:date', value: string): void;
  (e: 'update:availability', value: AvailabilityResult): void;
}>();

const { getAvailabilityForSlotAndDate } = useGuestSpot();
const availabilityLoading = ref(false);
const availabilityResult = ref<AvailabilityResult | null>(null);

watch(
  () => [props.date, props.slotData] as const,
  async ([date, slotData]) => {
    if (!date || !slotData?.documentId) {
      availabilityResult.value = null;
      // Emit non-blocking so parent does not disable Next when no date selected
      const total = slotData?.spaces ?? 1;
      emit('update:availability', { available: total, total, taken: 0 });
      return;
    }
    availabilityLoading.value = true;
    availabilityResult.value = null;
    try {
      const { taken } = await getAvailabilityForSlotAndDate(slotData.documentId, date);
      const total = slotData.spaces ?? 0;
      const available = Math.max(0, total - taken);
      const result: AvailabilityResult = { available, total, taken };
      availabilityResult.value = result;
      emit('update:availability', result);
    } finally {
      availabilityLoading.value = false;
    }
  },
  { immediate: true },
);

const formRef = ref<QForm | null>(null);

const dateModel = computed({
  get: () => props.date,
  set: (val: string) => emit('update:date', val),
});

const isDateAllowed = (date: string) => {
  const selected = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);

  // Only allow future dates
  if (selected < today) {
    return false;
  }

  // If opening hours are provided, check if the selected day has available hours
  if (props.openingHours.length > 0) {
    const dayOfWeek = selected.getDay();
    const dayKeys: Record<number, IOpeningHours['day']> = {
      0: 'sun',
      1: 'mon',
      2: 'tue',
      3: 'wed',
      4: 'thu',
      5: 'fri',
      6: 'sat',
    };
    const dayKey = dayKeys[dayOfWeek];
    const dayHours = props.openingHours.find((h) => h.day === dayKey);

    // If no opening hours for this day, allow it (shop might be flexible)
    if (!dayHours) return true;

    // If opening hours exist but no start/end, don't allow
    if (!dayHours.start || !dayHours.end) return false;

    return true;
  }

  return true;
};

const validateForm = () => {
  return !!props.date;
};

const resetForm = () => {
  formRef.value?.resetValidation();
  formRef.value?.reset();
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

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .input-label {
    font-weight: 600;
    font-size: 14px;
  }
}

.date-picker-inline {
  width: 100%;
  max-width: 320px;
}

.availability-loading {
  color: var(--q-primary);
}

.availability-none {
  background: rgba(255, 193, 7, 0.15);
  border-left: 4px solid var(--q-warning);
  font-weight: 600;
}

.availability-spots {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--bg-block);
}

.availability-spots__text {
  font-size: 14px;
  font-weight: 600;
}
</style>
