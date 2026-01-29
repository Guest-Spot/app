<template>
  <div
    class="guest-spot-booking-card bg-block q-pa-md border-radius-md cursor-pointer"
    @click="handleClick"
  >
    <div class="flex no-wrap items-start justify-between full-width">
      <div class="user-info">
        <!-- Shop view: show artist -->
        <template v-if="viewAs === 'shop'">
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
        </template>
        <!-- Artist view: show shop and slot -->
        <template v-else>
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
        </template>
      </div>

      <div class="card-header">
        <div class="status-badge" :class="`status-badge--${statusVariant}`">
          <q-icon :name="statusIcon" size="16px" />
          <span>{{ statusLabel }}</span>
        </div>
      </div>
    </div>

    <div v-if="slotTitleOrDescription" class="shop-conditions q-mb-md q-mt-sm bg-block border-radius-md">
      <div class="shop-conditions__label text-caption text-primary">Shop conditions</div>
      <div class="shop-conditions__text text-body2 text-grey-6">{{ slotTitleOrDescription }}</div>
    </div>

    <div class="booking-details">
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
      <div v-if="showDeposit" class="detail-item q-mb-xs">
        <q-icon name="payment" size="16px" color="grey-6" />
        <span class="text-grey-6">Deposit: ${{ depositAmountText }}</span>
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IGuestSpotBooking } from 'src/interfaces/guestSpot';
import { EGuestSpotBookingStatus } from 'src/interfaces/enums';
import useDate from 'src/modules/useDate';
import { centsToDollars } from 'src/helpers/currency';

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
}>();

const { formatDate, formatTime } = useDate();

const statusLabel = computed(() => {
  const statusMap: Record<EGuestSpotBookingStatus, string> = {
    [EGuestSpotBookingStatus.Pending]: 'Pending',
    [EGuestSpotBookingStatus.Accepted]: 'Accepted',
    [EGuestSpotBookingStatus.Rejected]: 'Rejected',
    [EGuestSpotBookingStatus.Completed]: 'Completed',
    [EGuestSpotBookingStatus.Cancelled]: 'Cancelled',
  };
  return statusMap[props.booking.status] || 'Unknown';
});

const statusVariant = computed(() => {
  const variantMap: Record<EGuestSpotBookingStatus, string> = {
    [EGuestSpotBookingStatus.Pending]: 'warning',
    [EGuestSpotBookingStatus.Accepted]: 'info',
    [EGuestSpotBookingStatus.Rejected]: 'negative',
    [EGuestSpotBookingStatus.Completed]: 'positive',
    [EGuestSpotBookingStatus.Cancelled]: 'grey',
  };
  return variantMap[props.booking.status] || 'grey';
});

const statusIcon = computed(() => {
  const iconMap: Record<EGuestSpotBookingStatus, string> = {
    [EGuestSpotBookingStatus.Pending]: 'schedule',
    [EGuestSpotBookingStatus.Accepted]: 'check_circle',
    [EGuestSpotBookingStatus.Rejected]: 'cancel',
    [EGuestSpotBookingStatus.Completed]: 'done_all',
    [EGuestSpotBookingStatus.Cancelled]: 'block',
  };
  return iconMap[props.booking.status] || 'help';
});

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

const slotTitleOrDescription = computed(() => {
  const slot = props.booking.slot;
  if (!slot) return '';
  return slot.title?.trim() || slot.description?.trim() || '';
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

const handleClick = () => {
  emit('click', props.booking);
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

  &--grey {
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

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;

  .q-btn {
    font-weight: 600;
    flex: 1;
    min-width: 0;
  }
}
</style>
