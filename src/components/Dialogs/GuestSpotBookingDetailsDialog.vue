<template>
  <q-dialog v-model="isVisible" position="bottom" persistent>
    <q-card class="guest-spot-booking-details-dialog">
      <q-card-section class="dialog-header">
        <div class="text-subtitle1 text-bold">Guest Spot Booking Details</div>
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

      <q-card-section v-if="booking" class="dialog-content">
        <GuestSpotBookingCard
          :booking="booking"
          :read-only="true"
          view-as="artist"
          @click="noop"
        />
        <DepositPaymentSection
          v-if="canInitiatePayment"
          :deposit-amount="depositAmountDollars"
          :total-amount="totalPaymentAmount"
          :can-initiate-payment="canInitiatePayment"
          :is-processing="isPaymentProcessing"
          :show-cancel="false"
          @pay="handlePayment"
        />
      </q-card-section>

      <q-card-actions v-if="!canInitiatePayment" class="dialog-actions bg-block">
        <q-btn
          label="Close"
          rounded
          unelevated
          class="full-width bg-block"
          @click="closeDialog"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { IGuestSpotBooking } from 'src/interfaces/guestSpot';
import { EGuestSpotBookingStatus } from 'src/interfaces/enums';
import GuestSpotBookingCard from 'src/components/GuestSpot/GuestSpotBookingCard.vue';
import DepositPaymentSection from 'src/components/Bookings/DepositPaymentSection.vue';
import { useUserStore } from 'src/stores/user';
import { useSettingsStore } from 'src/stores/settings';
import { centsToDollars } from 'src/helpers/currency';
import { computeTotalPaymentAmount } from 'src/helpers/currency';
import useGuestSpotPayment from 'src/composables/useGuestSpotPayment';

interface Props {
  modelValue: boolean;
  booking: IGuestSpotBooking | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const userStore = useUserStore();
const settingsStore = useSettingsStore();
const { initiateDeposit, isProcessing: isPaymentProcessing } = useGuestSpotPayment();

const isVisible = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
  }
);

watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

const isCurrentUserArtist = computed(() => {
  if (!props.booking) return false;
  const currentId = userStore.getUser?.documentId;
  const artistId = props.booking.artist?.documentId ?? props.booking.artistDocumentId;
  return Boolean(currentId && artistId && currentId === artistId);
});

const depositAmountDollars = computed(() => {
  if (!props.booking?.depositAmount) return 0;
  const dollars = centsToDollars(props.booking.depositAmount);
  return dollars ?? 0;
});

const totalPaymentAmount = computed(() => {
  const feePercent = settingsStore.getTotalFeePercent;
  return computeTotalPaymentAmount(depositAmountDollars.value, feePercent ?? null);
});

const canInitiatePayment = computed(() => {
  if (!props.booking || !isCurrentUserArtist.value) return false;
  return (
    props.booking.status === EGuestSpotBookingStatus.Pending &&
    !props.booking.depositAuthorized &&
    !props.booking.depositCaptured &&
    (props.booking.depositAmount ?? 0) > 0 &&
    settingsStore.getStripeEnabled === true
  );
});

function noop() {}

const closeDialog = () => {
  isVisible.value = false;
};

const handlePayment = async () => {
  if (!props.booking?.documentId) return;
  await initiateDeposit(props.booking.documentId);
};
</script>

<style scoped lang="scss">
.guest-spot-booking-details-dialog {
  min-width: 360px;
  max-width: 480px;
  border-radius: 20px;
}

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
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dialog-actions {
  padding: 16px 20px 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .q-btn {
    font-weight: 600;
  }
}

.body--dark {
  .guest-spot-booking-details-dialog .dialog-header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
}
</style>
