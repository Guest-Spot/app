<template>
  <div class="bookings-tab flex column q-gap-md">
    <!-- Header -->
    <div class="bookings-header">
      <h3 class="text-subtitle1 text-bold q-my-none">My Bookings</h3>
      <div class="flex q-gap-xs">
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
          <BookingCard
            v-for="booking in sentBookings"
            :key="booking.id"
            :booking="booking"
            @cancel="cancelBooking"
          />
        </div>
      </div>

      <!-- Received Bookings -->
      <div v-if="activeFilter === 'all' || activeFilter === 'received'" class="bookings-section">
        <div v-if="!receivedBookings.length" class="empty-state">
          <q-icon name="inbox" size="48px" color="grey-6" />
          <p class="empty-text">No received requests yet</p>
        </div>
        
        <div v-else class="bookings-grid">
          <BookingCard
            v-for="booking in receivedBookings"
            :key="booking.id"
            :booking="booking"
            @accept="acceptBooking"
            @reject="rejectBooking"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import type { IBooking } from 'src/interfaces/booking';
import { BookingCard } from './index';

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
      shopAvatar: 'https://picsum.photos/300/300?random=3',
      artistAvatar: 'https://picsum.photos/300/300?random=4',
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
      shopAvatar: 'https://picsum.photos/300/300?random=5',
      artistAvatar: 'https://picsum.photos/300/300?random=6',
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
      gap: 16px;
    }
  }
}
</style>
