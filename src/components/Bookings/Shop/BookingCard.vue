<template>
  <div class="booking-card" :class="{ sent: isSent, received: isReceived }">
    <div class="card-header">
      <div class="user-info">
        <q-avatar size="40px" class="q-mr-sm">
          <q-img
            :src="artist?.avatar"
            fit="cover"
            spinner-color="dark"
            spinner-size="16px"
          />
        </q-avatar>
        <div class="flex column">
          <div class="user-name">{{ artist?.name || 'User' }}</div>
          <div v-if="location" class="location-info">
            <q-icon name="location_on" size="16px" color="grey-6" />
            <span>{{ location }}</span>
          </div>
        </div>
      </div>
      <div class="status-badge absolute-top-right q-mr-md q-mt-md" :class="status">
        {{ getStatusLabel(status) }}
      </div>
    </div>
    
    <div class="card-content">
      <h4 class="booking-title">{{ title }}</h4>
      <p class="booking-description">{{ description }}</p>
      <div class="date-info q-mb-xs">
        <q-icon name="event" size="16px" color="grey-6" />
        <span>{{ formatDate(date) }}</span>
      </div>
      <div class="time-info">
        <q-icon name="schedule" size="16px" color="grey-6" />
        <span>{{ startTime }} - {{ endTime }}</span>
      </div>
    </div>
    
    <div class="card-actions">
      <!-- Actions for received bookings -->
      <div v-if="isReceived && status === 'pending'" class="action-buttons">
        <q-btn
          label="Reject"
          color="negative"
          outline
          rounded
          size="sm"
          @click="$emit('reject', id)"
        />
        <q-btn
          label="Accept"
          color="dark"
          rounded
          size="sm"
          @click="$emit('accept', id)"
        />
      </div>
      
      <!-- Actions for sent bookings -->
      <q-btn
        v-else-if="isSent && status === 'pending'"
        label="Cancel"
        color="negative"
        outline
        rounded
        size="sm"
        @click="$emit('cancel', id)"
      />
      
      <!-- View details for other statuses -->
      <q-btn
        v-else
        label="View Artist"
        color="dark"
        outline
        rounded
        :to="`/artist/${artist?.id}`"
        class="full-width"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent } from 'vue';
import type { IBooking } from 'src/interfaces/booking';

defineComponent({
  name: 'BookingCard'
});

interface Props {
  booking: IBooking;
}

interface Emits {
  (e: 'accept', id: number): void;
  (e: 'reject', id: number): void;
  (e: 'cancel', id: number): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

// Computed properties
const {
  id,
  title,
  description,
  startTime,
  endTime,
  date,
  status,
  type,
  artist,
  location,
} = props.booking;

// Determine if this is a sent or received booking for the current user
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
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(240, 248, 255, 0.9) 100%);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  overflow: hidden;
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    
    .user-info {
      display: flex;
      align-items: center;
      
      .user-name {
        font-weight: 600;
        color: var(--brand-dark);
        font-size: 16px;
      }
      
      .booking-date {
        color: var(--text-secondary);
        font-size: 14px;
        margin-top: 2px;
      }
    }
    
    .status-badge {
      padding: 2px 6px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 600;
      
      &.pending {
        background: var(--q-warning);
        color: white;
      }
      
      &.accepted {
        background: var(--q-positive);
        color: white;
      }
      
      &.rejected {
        background: var(--q-negative);
        color: white;
      }
      
      &.cancelled {
        background: var(--grey-6);
        color: white;
      }
      
      &.completed {
        background: var(--info);
        color: white;
      }
    }
  }
  
  .card-content {
    margin-bottom: 20px;
    
    .booking-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--brand-dark);
      margin: 0;
    }
    
    .booking-description {
      color: var(--text-secondary);
      margin: 0 0 16px 0;
      line-height: 1.5;
    }

    .date-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      font-size: 14px;
    }
    
    .time-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      font-size: 14px;
    }
    
    .location-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      font-size: 14px;
      margin-top: 8px;
    }
  }
  
  .card-actions {
    .action-buttons {
      display: flex;
      gap: 12px;
    }
    
    .q-btn {
      font-weight: 600;
    }
  }
}
</style>
