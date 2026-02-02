<template>
  <div
    class="guest-spot-booking-card bg-block q-pa-md border-radius-md cursor-pointer"
    @click="handleClick"
  >
    <div class="flex no-wrap items-start justify-between full-width">
      <!-- Shop view: show artist (link to public profile when id available) -->
      <router-link
        v-if="viewAs === 'shop' && artistProfileUrl"
        :to="artistProfileUrl"
        class="user-info text-grey-6 no-underline"
        @click.stop
      >
        <q-avatar size="40px" class="q-mr-sm bg-block">
          <q-img
            v-if="booking.artist?.avatar?.url"
            :src="booking.artist.avatar.url"
            spinner-color="dark"
            spinner-size="16px"
            :ratio="0.85"
          />
          <q-icon v-else name="person" size="22px" color="grey-6" />
        </q-avatar>
        <div class="flex column">
          <div class="user-role text-grey-6 text-caption">Artist</div>
          <div class="user-name text-weight-medium">{{ booking.artist?.name || 'Unknown' }}</div>
        </div>
      </router-link>
      <div v-else-if="viewAs === 'shop'" class="user-info">
        <q-avatar size="40px" class="q-mr-sm bg-block">
          <q-img
            v-if="booking.artist?.avatar?.url"
            :src="booking.artist.avatar.url"
            spinner-color="dark"
            spinner-size="16px"
            :ratio="0.85"
          />
          <q-icon v-else name="person" size="22px" color="grey-6" />
        </q-avatar>
        <div class="flex column">
          <div class="user-role text-grey-6 text-caption">Artist</div>
          <div class="user-name text-weight-medium">{{ booking.artist?.name || 'Unknown' }}</div>
        </div>
      </div>
      <!-- Artist view: show shop (link to public profile when id available) -->
      <router-link
        v-else-if="shopProfileUrl"
        :to="shopProfileUrl"
        class="user-info text-grey-6 no-underline"
        @click.stop
      >
        <q-avatar size="40px" class="q-mr-sm bg-block">
          <q-img
            v-if="booking.shop?.avatar?.url"
            :src="booking.shop.avatar.url"
            spinner-color="dark"
            spinner-size="16px"
            :ratio="0.85"
          />
          <q-icon v-else name="store" size="22px" color="grey-6" />
        </q-avatar>
        <div class="flex column">
          <div class="user-role text-grey-6 text-caption">Guest Spot</div>
          <div class="user-name text-weight-medium">{{ booking.shop?.name || 'Unknown' }}</div>
        </div>
      </router-link>
      <div v-else class="user-info">
        <q-avatar size="40px" class="q-mr-sm bg-block">
          <q-img
            v-if="booking.shop?.avatar?.url"
            :src="booking.shop.avatar.url"
            spinner-color="dark"
            spinner-size="16px"
            :ratio="0.85"
          />
          <q-icon v-else name="store" size="22px" color="grey-6" />
        </q-avatar>
        <div class="flex column">
          <div class="user-role text-grey-6 text-caption">Guest Spot</div>
          <div class="user-name text-weight-medium">{{ booking.shop?.name || 'Unknown' }}</div>
        </div>
      </div>

      <div class="card-header">
        <div class="status-badge" :class="`status-badge--${statusVariant}`">
          <q-icon :name="statusIcon" size="16px" />
          <span>{{ statusLabel }}</span>
        </div>
      </div>
    </div>

    <div v-if="slotTitleOrDescription && viewAs === 'artist'" class="shop-conditions q-mt-md bg-block border-radius-md">
      <div class="shop-conditions__label text-caption text-primary">Shop description</div>
      <div class="shop-conditions__text text-body2 text-grey-6">{{ slotTitleOrDescription }}</div>
    </div>

    <div class="booking-details q-mt-md">
      <div class="detail-item q-mb-xs">
        <q-icon name="event" size="16px" color="grey-6" />
        <span class="text-grey-6">{{ formattedDate }}</span>
      </div>
      <div v-if="booking.selectedTime" class="detail-item q-mb-xs">
        <q-icon name="schedule" size="16px" color="grey-6" />
        <span class="text-grey-6">{{ formattedTime }}</span>
      </div>
      <div v-if="booking.comment" class="detail-item q-mb-xs">
        <q-icon name="comment" size="16px" color="grey-6" />
        <span class="text-grey-6">{{ booking.comment }}</span>
      </div>
      <div v-if="showDepositLine" class="deposit-detail">
        <div class="detail-item q-mb-xs">
          <q-icon name="payment" size="16px" color="grey-6" />
          <span class="text-grey-6">Deposit: ${{ depositAmountText }}</span>
        </div>
        <div v-if="commissionDollars > 0" class="detail-item q-mb-xs deposit-detail__commission">
          <span class="text-grey-6">Platform commission: ${{ commissionAmountText }}</span>
        </div>
      </div>
    </div>

    <div v-if="viewAs === 'shop' && !readOnly && showActions" class="actions q-mt-md">
      <q-btn
        v-if="canReject"
        label="Reject"
        color="negative"
        rounded
        flat
        class="bg-block"
        @click.stop="handleReject"
        :loading="isProcessing"
      />
      <q-btn
        v-if="canApprove"
        label="Approve"
        color="primary"
        rounded
        class="bg-block"
        @click.stop="handleApprove"
        :loading="isProcessing"
      />
    </div>

    <div v-if="viewAs === 'artist' && needsDepositPayment && canShowPayButton" class="actions column items-center q-mt-md">
      <q-btn
        :label="payButtonLabel"
        color="primary"
        rounded
        class="bg-block full-width"
        icon="payment"
        :loading="isPaymentProcessing"
        @click.stop="handlePayDeposit"
      />
      <p class="pay-deposit-hint text-caption text-grey-6 q-mt-none q-mb-none">
        Booking will be confirmed only after payment
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IGuestSpotBooking } from 'src/interfaces/guestSpot';
import { EGuestSpotBookingStatus } from 'src/interfaces/enums';
import { getGuestSpotBookingStatusInfo } from 'src/helpers/bookingStatus';
import useDate from 'src/modules/useDate';
import { centsToDollars, computeTotalPaymentAmount } from 'src/helpers/currency';
import { useSettingsStore } from 'src/stores/settings';
import useGuestSpotPayment from 'src/composables/useGuestSpotPayment';

interface Props {
  booking: IGuestSpotBooking;
  isProcessing?: boolean;
  readOnly?: boolean;
  viewAs?: 'shop' | 'artist';
}

const props = withDefaults(defineProps<Props>(), {
  isProcessing: false,
  readOnly: false,
  viewAs: 'shop',
});

const emit = defineEmits<{
  approve: [documentId: string];
  reject: [documentId: string, rejectNote?: string];
  click: [booking: IGuestSpotBooking];
  paid: [];
}>();

const settingsStore = useSettingsStore();
const { initiateDeposit, isProcessing: isPaymentProcessing } = useGuestSpotPayment();
const { formatDate, formatTime } = useDate();

const statusInfo = computed(() =>
  getGuestSpotBookingStatusInfo(props.booking, props.viewAs ?? 'shop')
);
const statusLabel = computed(() => statusInfo.value.label);
const statusVariant = computed(() => statusInfo.value.variant);
const statusIcon = computed(() => statusInfo.value.icon ?? 'help');

const needsDepositPayment = computed(
  () =>
    props.viewAs === 'artist' &&
    props.booking.status === EGuestSpotBookingStatus.Pending &&
    !props.booking.depositAuthorized &&
    !props.booking.depositCaptured &&
    (props.booking.depositAmount ?? 0) > 0
);

const formattedDate = computed(() => {
  if (!props.booking.selectedDate) return 'N/A';
  return formatDate(props.booking.selectedDate, { useUsFormat: true });
});

const formattedTime = computed(() => {
  if (!props.booking.selectedTime) return null;
  return formatTime(props.booking.selectedTime);
});

const depositAmountText = computed(() => {
  const amount = centsToDollars(props.booking.depositAmount);
  return amount ? amount.toFixed(2) : '0.00';
});

const showDeposit = computed(() => {
  return props.booking.depositAuthorized || props.booking.depositCaptured;
});

const showDepositLine = computed(
  () => showDeposit.value || needsDepositPayment.value
);

const slotTitleOrDescription = computed(() => {
  const slot = props.booking.slot;
  if (!slot) return '';
  return slot.title?.trim() || slot.description?.trim() || '';
});

const artistProfileUrl = computed(() => {
  const id = props.booking.artist?.documentId ?? props.booking.artistDocumentId;
  return id ? `/artist/${id}` : '';
});

const shopProfileUrl = computed(() => {
  const id = props.booking.shop?.documentId ?? props.booking.shopDocumentId;
  return id ? `/shop/${id}` : '';
});

const canApprove = computed(() => {
  return props.booking.status === EGuestSpotBookingStatus.Pending;
});

const canReject = computed(() => {
  return props.booking.status === EGuestSpotBookingStatus.Pending;
});

const showActions = computed(() => {
  return canApprove.value || canReject.value;
});

const depositDollars = computed(() => {
  const d = centsToDollars(props.booking.depositAmount);
  return d ?? 0;
});

const commissionDollars = computed(() => {
  const feePercent = settingsStore.getTotalFeePercent;
  if (!depositDollars.value || feePercent == null) return 0;
  return Math.round(depositDollars.value * (feePercent / 100) * 100) / 100;
});

const commissionAmountText = computed(() =>
  commissionDollars.value > 0 ? commissionDollars.value.toFixed(2) : '0.00'
);

const totalPaymentAmount = computed(() => {
  const feePercent = settingsStore.getTotalFeePercent;
  return computeTotalPaymentAmount(depositDollars.value, feePercent ?? null);
});

const canShowPayButton = computed(
  () => settingsStore.getStripeEnabled === true
);

const payButtonLabel = computed(() =>
  totalPaymentAmount.value
    ? `Pay Deposit ($${totalPaymentAmount.value.toFixed(2)})`
    : 'Pay Deposit'
);

const handleClick = () => {
  emit('click', props.booking);
};

const handlePayDeposit = async () => {
  const success = await initiateDeposit(props.booking.documentId);
  if (success) {
    emit('paid');
  }
};

const handleApprove = () => {
  emit('approve', props.booking.documentId);
};

const handleReject = () => {
  emit('reject', props.booking.documentId);
};
</script>

<style scoped lang="scss">
.guest-spot-booking-card {
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.card-header {
  display: flex;
  justify-content: flex-end;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;

  &--warning {
    background-color: rgba(242, 192, 55, 0.15);
    color: #f2c037;
  }

  &--info {
    background-color: rgba(49, 204, 236, 0.15);
    color: #31ccec;
  }

  &--negative {
    background-color: rgba(193, 0, 21, 0.15);
    color: #c10015;
  }

  &--positive {
    background-color: rgba(33, 186, 69, 0.15);
    color: #21ba45;
  }

  &--grey,
  &--neutral {
    background-color: rgba(128, 128, 128, 0.15);
    color: #808080;
  }
}

.user-info {
  display: flex;
  align-items: center;
}

.user-name {
  font-size: 16px;
}

.shop-conditions {
  padding: 10px 12px;
}

.shop-conditions__label {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.shop-conditions__text {
  line-height: 1.4;
}

.booking-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.deposit-detail__commission {
  padding-left: 24px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;

  .q-btn {
    font-weight: 600;
    flex: 1;
    min-width: 0;
  }
}
</style>
