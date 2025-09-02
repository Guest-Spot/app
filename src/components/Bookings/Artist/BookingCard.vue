<template>
  <div class="booking-card bg-block border-radius-md" :class="{ sent: isSent, received: isReceived }">
    <div class="card-header">
      <div class="shop-info flex column full-width relative-position">
        <q-img
          v-if="shop?.pictures?.[0]"
          class="full-width"
          :src="shop.pictures[0]"
          fit="cover"
          spinner-color="dark"
          spinner-size="16px"
        />
        <div class="absolute-bottom-left q-ml-md q-mb-md bg-white text-dark shop-name q-px-sm">
          {{ shop?.title || 'Shop' }}
        </div>
      </div>
      <div class="status-badge absolute-top-right q-mr-md q-mt-md" :class="status">
        {{ getStatusLabel(status) }}
      </div>
    </div>

    <div class="card-content q-px-md">
      <div class="flex items-center q-gap-xs q-mb-sm">
        <template v-if="isSent">
          <q-icon name="send" size="16px" color="primary" />
          <span class="text-primary text-weight-medium">Request to Shop</span>
        </template>
        <template v-else>
          <q-icon name="inbox" size="16px" color="primary" />
          <span class="text-primary text-weight-medium">Request from Shop</span>
        </template>
      </div>

      <h4 class="booking-title">{{ title }}</h4>
      <p class="booking-description text-grey-6">{{ description }}</p>

      <div v-if="location" class="location-info q-mb-xs text-grey-6">
        <q-icon name="location_on" size="16px" />
        <span>{{ location }}</span>
      </div>

      <div class="date-info q-mb-xs text-grey-6">
        <q-icon name="event" size="16px" />
        <span>{{ formatDate(date) }}</span>
      </div>

      <div class="time-info text-grey-6">
        <q-icon name="schedule" size="16px" />
        <span>{{ startTime }} - {{ endTime }}</span>
      </div>
    </div>

    <div class="card-actions q-px-md q-pb-md">
      <!-- Accept/Reject buttons for pending invitations -->
      <div v-if="isReceived && status === 'pending'" class="action-buttons">
        <q-btn
          label="Reject"
          color="negative"
          rounded
          flat
          @click="$emit('reject', uuid)"
          class="bg-block full-width"
        />
        <q-btn
          label="Accept"
          color="primary"
          rounded
          @click="$emit('accept', uuid)"
          class="full-width"
        />
      </div>

      <!-- Cancel button for pending requests -->
      <q-btn
        v-else-if="isSent && status === 'pending'"
        label="Cancel Request"
        color="negative"
        flat
        rounded
        @click="$emit('cancel', uuid)"
        class="bg-block full-width"
      />

      <!-- View shop for other statuses -->
      <q-btn
        v-else
        label="View Shop"
        rounded
        :to="`/shop/${shop?.uuid}`"
        flat
        class="bg-block full-width"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IBooking } from 'src/interfaces/booking';

interface Props {
  booking: IBooking;
}

interface Emits {
  (e: 'accept', uuid: string): void;
  (e: 'reject', uuid: string): void;
  (e: 'cancel', uuid: string): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

// Computed properties
const {
  uuid,
  title,
  description,
  startTime,
  endTime,
  date,
  status,
  shop,
  location,
  type,
} = props.booking;

const isReceived = computed(() => type === 'shop-to-artist');
const isSent = computed(() => type === 'artist-to-shop');

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getStatusLabel = (status: IBooking['status']) => {
  const statusMap = {
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    completed: 'Completed'
  };
  return statusMap[status];
};
</script>

<style scoped lang="scss">
.booking-card {
  transition: all 0.3s ease;
  overflow: hidden;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;

    .shop-info {
      display: flex;
      align-items: center;

      .shop-name {
        font-weight: 600;
        color: var(--q-primary);
        font-size: 16px;
        border-radius: 20px;
        font-size: 14px;
      }

      .q-img {
        height: 100px;
      }
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 600;

      &.pending {
        background: #ff9800;
        color: white;
      }

      &.accepted {
        background: #4caf50;
        color: white;
      }

      &.rejected {
        background: #f44336;
        color: white;
      }

      &.cancelled {
        background: #9e9e9e;
        color: white;
      }

      &.completed {
        background: #2196f3;
        color: white;
      }
    }
  }

  .card-content {
    margin-bottom: 20px;

    .request-type {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .booking-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }

    .booking-description {
      margin: 0 0 16px 0;
      line-height: 1.5;
    }

    .date-info, .time-info, .location-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      margin-bottom: 8px;
    }
  }

  .card-actions {
    .action-buttons {
      display: flex;
      gap: 16px;
    }

    .q-btn {
      font-weight: 600;
    }
  }
}
</style>
