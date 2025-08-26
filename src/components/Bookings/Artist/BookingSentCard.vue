<template>
  <div class="booking-sent-card">
    <div class="card-header">
      <div class="shop-info flex column full-width relative-position">
        <q-img
          class="full-width"
          :src="shop?.avatar"
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
      <div class="request-type q-mb-sm">
        <q-icon name="send" size="16px" color="blue-6" />
        <span class="text-blue-6 text-weight-medium">Request to Shop</span>
      </div>
      
      <h4 class="booking-title">{{ title }}</h4>
      <p class="booking-description">{{ description }}</p>
      
      <div v-if="location" class="location-info q-mb-xs">
        <q-icon name="location_on" size="16px" color="grey-6" />
        <span>{{ location }}</span>
      </div>
      
      <div class="date-info q-mb-xs">
        <q-icon name="event" size="16px" color="grey-6" />
        <span>{{ formatDate(date) }}</span>
      </div>
      
      <div class="time-info">
        <q-icon name="schedule" size="16px" color="grey-6" />
        <span>{{ startTime }} - {{ endTime }}</span>
      </div>
    </div>
    
    <div class="card-actions q-px-md q-pb-md">
      <!-- Cancel button for pending requests -->
      <q-btn
        v-if="status === 'pending'"
        label="Cancel Request"
        color="negative"
        outline
        rounded
        @click="$emit('cancel', id)"
        class="full-width"
      />
      
      <!-- View shop for other statuses -->
      <q-btn
        v-else
        label="View Shop"
        color="dark"
        outline
        rounded
        :to="`/shop/${shop?.id}`"
        class="full-width"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';
import type { IBooking } from 'src/interfaces/booking';

defineComponent({
  name: 'BookingSentCard'
});

interface Props {
  booking: IBooking;
}

interface Emits {
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
  shop,
  location,
} = props.booking;

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
.booking-sent-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(240, 248, 255, 0.9) 100%);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  overflow: hidden;
  
  &:hover {
    box-shadow: 0 8px 25px rgba(33, 150, 243, 0.15);
    transform: translateY(-3px);
    border-color: #2196f3;
  }
  
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
        color: #1976d2;
        font-size: 16px;
        border-radius: 20px;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
      color: #1976d2;
      margin: 0;
    }
    
    .booking-description {
      color: #424242;
      margin: 0 0 16px 0;
      line-height: 1.5;
    }

    .date-info, .time-info, .location-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #616161;
      font-size: 14px;
      margin-bottom: 8px;
    }
  }
  
  .card-actions {
    .q-btn {
      font-weight: 600;
    }
  }
}
</style>
