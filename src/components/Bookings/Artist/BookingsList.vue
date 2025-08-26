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
      <div v-if="activeFilter === 'sent'" class="bookings-section">
        <div v-if="!sentBookings.length" class="empty-state">
          <q-icon name="send" size="48px" color="grey-6" />
          <p class="empty-text">No sent requests to shops yet</p>
          <p class="empty-subtext">When you send requests to shops, they will appear here</p>
        </div>
        
        <div v-else class="bookings-grid">
          <BookingSentCard
            v-for="booking in sentBookings"
            :key="booking.id"
            :booking="booking"
            @cancel="cancelBooking"
          />
        </div>
      </div>

      <!-- Received Bookings -->
      <div v-if="activeFilter === 'received'" class="bookings-section">
        <div v-if="!receivedBookings.length" class="empty-state">
          <q-icon name="inbox" size="48px" color="grey-6" />
          <p class="empty-text">No invitations from shops yet</p>
          <p class="empty-subtext">When shops send you invitations, they will appear here</p>
        </div>
        
        <div v-else class="bookings-grid">
          <BookingReceivedCard
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
import BookingSentCard from 'src/components/Bookings/Artist/BookingSentCard.vue';
import BookingReceivedCard from 'src/components/Bookings/Artist/BookingReceivedCard.vue';

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
      position: 'top',
      actions: [
        {
          icon: 'close',
          color: 'white',
        }
      ]
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
      color: 'negative',
      message: 'Booking rejected',
      position: 'top',
      actions: [
        {
          icon: 'close',
          color: 'white',
        }
      ]
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
        color: 'negative',
        message: 'Booking cancelled',
        position: 'top',
        actions: [
          {
            icon: 'close',
            color: 'white',
          }
        ]
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
      description: 'I would like to visit your shop and ...',
      shopId: 1,
      artistId: 2,
      location: '123 Main St, Anytown, USA',
      startTime: '10:00',
      endTime: '14:00',
      date: '2024-02-15',
      status: 'pending',
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z',
      type: 'shop-to-artist',
      shop: {
        id: 1,
        title: 'Tattoo Studio',
        avatar: 'https://picsum.photos/300/300?random=1',
      },
    },
    {
      id: 2,
      title: 'Art Commission',
      description: 'Need artwork for shop decoration',
      shopId: 3,
      artistId: 1,
      location: '123 Main St, Anytown, USA',
      startTime: '09:00',
      endTime: '17:00',
      date: '2024-02-20',
      status: 'accepted',
      createdAt: '2024-01-18T14:00:00Z',
      updatedAt: '2024-01-19T09:00:00Z',
      type: 'artist-to-shop',
      shop: {
        id: 3,
        title: 'Art Gallery',
        avatar: 'https://picsum.photos/300/300?random=3',
      },
    },
    {
      id: 3,
      title: 'Master Class',
      description: 'Need a master class in tattooing',
      shopId: 2,
      artistId: 2,
      location: '123 Main St, Anytown, USA',
      startTime: '09:00',
      endTime: '17:00',
      date: '2024-02-20',
      status: 'pending',
      createdAt: '2024-01-18T14:00:00Z',
      updatedAt: '2024-01-19T09:00:00Z',
      type: 'artist-to-shop',
      shop: {
        id: 3,
        title: 'Art Gallery',
        avatar: 'https://picsum.photos/300/300?random=3',
      },
    },
    {
      id: 3,
      title: 'Tattoo Session Request',
      description: 'Looking for a skilled artist for a custom tattoo design',
      shopId: 3,
      artistId: 1,
      location: '123 Main St, Anytown, USA',
      startTime: '09:00',
      endTime: '17:00',
      date: '2024-02-20',
      status: 'rejected',
      createdAt: '2024-01-18T14:00:00Z',
      updatedAt: '2024-01-19T09:00:00Z',
      type: 'artist-to-shop',
      shop: {
        id: 5,
        title: 'Tattoo Studio',
        avatar: 'https://picsum.photos/300/300?random=5',
      },
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
    
    .filter-tab {
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-1px);
      }
    }
  }

  .bookings-section {
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--text-secondary);
      
      .empty-text {
        margin: 16px 0 8px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
      }
      
      .empty-subtext {
        margin: 0;
        font-size: 14px;
        color: var(--text-secondary);
        opacity: 0.8;
      }
    }
    
    .bookings-grid {
      display: grid;
      gap: 16px;
    }
  }
}
</style>
