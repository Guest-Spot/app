<template>
  <div class="bookings-tab flex column q-gap-md">
    <!-- Header -->
    <div class="bookings-header">
      <h3 class="text-subtitle1 text-bold q-my-none">Bookings</h3>
      <div class="flex q-gap-sm">
        <q-btn
          v-for="filter in filterTabs"
          :key="filter.value"
          :outline="activeFilter !== filter.value"
          :color="activeFilter === filter.value ? 'dark' : 'grey-6'"
          :text-color="activeFilter === filter.value ? 'white' : 'dark'"
          rounded
          size="sm"
          @click="setActiveFilter(filter.value)"
          class="filter-tab"
        >
          <span>{{ filter.label }}</span>
          <span class="text-bold q-ml-xs">({{ filter.value === 'sent' ? sentBookings.length : receivedBookings.length }})</span>
        </q-btn>
      </div>
    </div>

    <!-- Bookings List -->
    <div class="bookings-list">
      <!-- Sent Bookings -->
      <div v-if="activeFilter === 'all' || activeFilter === 'sent'" class="bookings-section">
        <div v-if="!sentBookings.length" class="empty-state">
          <q-icon name="send" size="48px" color="grey-6" />
          <p class="empty-text">No sent requests yet</p>
        </div>
        
        <div v-else class="bookings-grid">
          <div
            v-for="booking in sentBookings"
            :key="booking.id"
            class="booking-card sent"
          >
            <div class="card-header">
              <div class="recipient-info">
                <q-avatar size="40px" class="q-mr-sm">
                  <img :src="booking.shopAvatar || '/src/assets/default-avatar.png'" />
                </q-avatar>
                <div>
                  <div class="recipient-name">{{ booking.shopName || 'Shop' }}</div>
                  <div class="booking-date">{{ formatDate(booking.date) }}</div>
                </div>
              </div>
              <div class="status-badge" :class="booking.status">
                {{ getStatusLabel(booking.status) }}
              </div>
            </div>
            
            <div class="card-content">
              <h4 class="booking-title">{{ booking.title }}</h4>
              <p class="booking-description">{{ booking.description }}</p>
              <div class="time-info">
                <q-icon name="schedule" size="16px" color="grey-6" />
                <span>{{ booking.startTime }} - {{ booking.endTime }}</span>
              </div>
            </div>
            
            <div class="card-actions">
              <q-btn
                v-if="booking.status === 'pending'"
                label="Cancel"
                color="negative"
                outline
                rounded
                size="sm"
                @click="cancelBooking(booking.id)"
              />
              <q-btn
                v-if="booking.status === 'accepted'"
                label="View Details"
                color="dark"
                outline
                rounded
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Received Bookings -->
      <div v-if="activeFilter === 'all' || activeFilter === 'received'" class="bookings-section">
        <div v-if="!receivedBookings.length" class="empty-state">
          <q-icon name="inbox" size="48px" color="grey-6" />
          <p class="empty-text">No received requests yet</p>
        </div>
        
        <div v-else class="bookings-grid">
          <div
            v-for="booking in receivedBookings"
            :key="booking.id"
            class="booking-card received"
          >
            <div class="card-header">
              <div class="sender-info">
                <q-avatar size="40px" class="q-mr-sm">
                  <img :src="booking.shopAvatar || '/src/assets/default-avatar.png'" />
                </q-avatar>
                <div>
                  <div class="sender-name">{{ booking.shopName || 'Shop' }}</div>
                  <div class="booking-date">{{ formatDate(booking.date) }}</div>
                </div>
              </div>
              <div class="status-badge" :class="booking.status">
                {{ getStatusLabel(booking.status) }}
              </div>
            </div>
            
            <div class="card-content">
              <h4 class="booking-title">{{ booking.title }}</h4>
              <p class="booking-description">{{ booking.description }}</p>
              <div class="time-info">
                <q-icon name="schedule" size="16px" color="grey-6" />
                <span>{{ booking.startTime }} - {{ booking.endTime }}</span>
              </div>
            </div>
            
            <div class="card-actions">
              <div v-if="booking.status === 'pending'" class="action-buttons">
                <q-btn
                  label="Reject"
                  color="negative"
                  outline
                  rounded
                  size="sm"
                  @click="rejectBooking(booking.id)"
                />
                <q-btn
                  label="Accept"
                  color="dark"
                  rounded
                  size="sm"
                  @click="acceptBooking(booking.id)"
                />
              </div>
              <q-btn
                v-else
                label="View Details"
                color="dark"
                outline
                rounded
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import type { IBooking } from 'src/interfaces/booking';

const $q = useQuasar();

// State
const bookings = ref<IBooking[]>([]);

// Filter tabs
const filterTabs = [
  { label: 'Sent', value: 'sent' },
  { label: 'Received', value: 'received' }
];

const activeFilter = ref('sent');

// Computed properties
const sentBookings = computed(() => {
  return bookings.value.filter(booking => 
    booking.type === 'artist-to-shop'
  );
});

const receivedBookings = computed(() => {
  return bookings.value.filter(booking => 
    booking.type === 'shop-to-artist'
  );
});

// Methods
const setActiveFilter = (filter: string) => {
  activeFilter.value = filter;
};

const acceptBooking = (bookingId: number) => {
  const booking = bookings.value.find(b => b.id === bookingId);
  if (booking) {
    booking.status = 'accepted';
    booking.updatedAt = new Date().toISOString();
    
    $q.notify({
      type: 'positive',
      color: 'dark',
      message: 'Booking accepted!',
      position: 'top'
    });
  }
};

const rejectBooking = (bookingId: number) => {
  const booking = bookings.value.find(b => b.id === bookingId);
  if (booking) {
    booking.status = 'rejected';
    booking.updatedAt = new Date().toISOString();
    
    $q.notify({
      type: 'info',
      message: 'Booking rejected',
      position: 'top'
    });
  }
};

const cancelBooking = (bookingId: number) => {
  $q.dialog({
    title: 'Cancel Booking',
    message: 'Are you sure you want to cancel this booking request?',
    cancel: {
      color: 'grey-6',
      rounded: true,
      label: 'No, Keep It'
    },
    ok: {
      color: 'negative',
      rounded: true,
      label: 'Yes, Cancel'
    }
  }).onOk(() => {
    const booking = bookings.value.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'cancelled';
      booking.updatedAt = new Date().toISOString();
      
      $q.notify({
        type: 'info',
        message: 'Booking cancelled',
        position: 'top'
      });
    }
  });
};

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

// Load mock data on mount
onMounted(() => {
  // Mock data for demonstration
  bookings.value = [
    {
      id: 1,
      title: 'Tattoo Session Request',
      description: 'Looking for a skilled artist for a custom tattoo design',
      shopId: 1,
      artistId: 2,
      startTime: '10:00',
      endTime: '14:00',
      date: '2024-02-15',
      status: 'pending',
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z',
      type: 'shop-to-artist',
      shopName: 'Tattoo Studio',
      artistName: 'Your Name',
      shopAvatar: 'https://picsum.photos/300/300?random=1',
      artistAvatar: 'https://picsum.photos/300/300?random=2',
    },
    {
      id: 2,
      title: 'Art Commission',
      description: 'Need artwork for shop decoration',
      shopId: 3,
      artistId: 1,
      startTime: '09:00',
      endTime: '17:00',
      date: '2024-02-20',
      status: 'accepted',
      createdAt: '2024-01-18T14:00:00Z',
      updatedAt: '2024-01-19T09:00:00Z',
      type: 'artist-to-shop',
      shopName: 'Art Gallery',
      artistName: 'Your Name',
      shopAvatar: 'https://picsum.photos/300/300?random=1',
      artistAvatar: 'https://picsum.photos/300/300?random=2',
    },
    {
      id: 3,
      title: 'Tattoo Session Request',
      description: 'Looking for a skilled artist for a custom tattoo design',
      shopId: 3,
      artistId: 1,
      startTime: '09:00',
      endTime: '17:00',
      date: '2024-02-20',
      status: 'rejected',
      createdAt: '2024-01-18T14:00:00Z',
      updatedAt: '2024-01-19T09:00:00Z',
      type: 'artist-to-shop',
      shopName: 'Tattoo Studio',
      artistName: 'Your Name',
      shopAvatar: 'https://picsum.photos/300/300?random=1',
      artistAvatar: 'https://picsum.photos/300/300?random=2',
    },
  ];
});
</script>

<style scoped lang="scss">
.bookings-tab {
  .bookings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 4px 4px 4px 16px;
  }

  .bookings-section {
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--text-secondary);
      
      .empty-text {
        margin: 16px 0;
        font-size: 16px;
      }
    }
    
    .bookings-grid {
      display: grid;
      gap: 20px;
    }
    
    .booking-card {
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 20px;
      border: 1px solid var(--border-light);
      transition: all 0.3s ease;
      
      &:hover {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }
      
      &.sent {
        border-left: 4px solid var(--brand-dark);
      }
      
      &.received {
        border-left: 4px solid var(--brand-dark);
      }
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
        
        .recipient-info,
        .sender-info {
          display: flex;
          align-items: center;
          
          .recipient-name,
          .sender-name {
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
          margin: 0 0 8px 0;
        }
        
        .booking-description {
          color: var(--text-secondary);
          margin: 0 0 16px 0;
          line-height: 1.5;
        }
        
        .time-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 14px;
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
  }
}
</style>
