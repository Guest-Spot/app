<template>
  <div class="step-content">
    <q-form ref="formRef" class="date-form flex column items-center q-gap-lg">
      <div class="input-group">
        <q-date
          :model-value="props.date"
          mask="YYYY-MM-DD"
          class="date-picker-inline bg-block border-radius-md"
          :options="isDateAllowed"
          :events="bookedDates"
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
}>();

const userStore = useUserStore();
const artistDocumentId = computed(() => userStore.getUser?.documentId);
const { getBookingsForCurrentUser } = useGuestSpot();
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

const bookedDates = computed(() =>
  Array.from(bookingByDate.value.keys()).map((key) => key.replace(/-/g, '/')),
);

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
    resetBookedDateDialog();
    currentSlotDocumentId.value = slotDocumentId;
    if (!slotDocumentId) {
      bookingRequestId += 1;
      userBookings.value = [];
    }
  },
  { immediate: true },
);

// Load bookings only when both slot and user are available (getBookingsForCurrentUser returns [] if user not in store yet).
watch(
  () => [currentSlotDocumentId.value, artistDocumentId.value] as const,
  ([slotId, artistId]) => {
    if (!slotId) return;
    if (!artistId) {
      bookingRequestId += 1;
      userBookings.value = [];
      return;
    }
    void loadUserBookingsForSlot(slotId);
  },
  { immediate: true },
);

const formRef = ref<QForm | null>(null);

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
</style>
