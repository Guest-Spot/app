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
          :model-value="props.date"
          mask="YYYY-MM-DD"
          class="date-picker-inline bg-block border-radius-md"
          :options="isDateAllowed"
          :events="isBookedDate"
          event-color="primary"
          @update:model-value="onDateSelect"
        />
      </div>
    </q-form>

    <BookedDateDialog
      v-model="showBookedDateDialog"
      :booking="selectedBookingForDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type PropType } from 'vue';
import type { QForm } from 'quasar';
import type { IOpeningHours } from 'src/interfaces/common';
import type { IGuestSpotSlot, IGuestSpotBooking } from 'src/interfaces/guestSpot';
import useGuestSpot from 'src/composables/useGuestSpot';
import BookedDateDialog from 'src/components/Dialogs/BookedDateDialog.vue';
import { useUserStore } from 'src/stores/user';

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

const userStore = useUserStore();
const artistDocumentId = computed(() => userStore.getUser?.documentId);
const { getAvailabilityForSlotAndDate, getBookingsForCurrentUser } = useGuestSpot();
const availabilityLoading = ref(false);
const availabilityResult = ref<AvailabilityResult | null>(null);
const userBookings = ref<IGuestSpotBooking[]>([]);
const showBookedDateDialog = ref(false);
const selectedBookingForDialog = ref<IGuestSpotBooking | null>(null);

/** Normalize to YYYY-MM-DD (API or QDate may use slashes/ISO) */
const toDateKey = (d?: string | null) => {
  if (!d) return '';
  return d.slice(0, 10).replace(/\//g, '-');
};

const bookingByDate = computed(() => {
  const m = new Map<string, IGuestSpotBooking>();
  userBookings.value.forEach((b) => {
    const key = toDateKey(b.selectedDate);
    if (key) m.set(key, b);
  });
  return m;
});

let bookingRequestId = 0;

const currentSlotDocumentId = ref<string | null>(null);

const resetBookedDateDialog = () => {
  showBookedDateDialog.value = false;
  selectedBookingForDialog.value = null;
};

const loadUserBookingsForSlot = async (slotDocumentId: string | null) => {
  if (!slotDocumentId) {
    bookingRequestId += 1;
    userBookings.value = [];
    return;
  }
  const requestId = ++bookingRequestId;
  try {
    const bookings = await getBookingsForCurrentUser(slotDocumentId);
    if (requestId !== bookingRequestId) return;
    userBookings.value = bookings;
  } catch (error) {
    console.error('Failed to load bookings for slot:', error);
    if (requestId === bookingRequestId) {
      userBookings.value = [];
    }
  }
};

watch(
  () => props.slotData?.documentId ?? null,
  (slotDocumentId) => {
    bookingRequestId += 1;
    currentSlotDocumentId.value = slotDocumentId;
    resetBookedDateDialog();
    if (!slotDocumentId) {
      userBookings.value = [];
    }
  },
  { immediate: true },
);

watch(
  () => [currentSlotDocumentId.value, artistDocumentId.value] as const,
  ([slotDocumentId, artistId]) => {
    if (!slotDocumentId) {
      return;
    }
    if (!artistId) {
      userBookings.value = [];
      return;
    }
    void loadUserBookingsForSlot(slotDocumentId);
  },
  { immediate: true },
);

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

const isBookedDate = (date: string) => {
  const key = toDateKey(date);
  return key ? bookingByDate.value.has(key) : false;
};

const onDateSelect = (val: string | null) => {
  const key = toDateKey(val);
  const booking = bookingByDate.value.get(key);
  if (!key) {
    emit('update:date', '');
    return;
  }
  if (booking) {
    selectedBookingForDialog.value = booking;
    showBookedDateDialog.value = true;
    return;
  }
  emit('update:date', key);
};

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
