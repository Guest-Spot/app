<template>
  <div class="bookings-tab flex column q-gap-md">
    <!-- Header -->
    <div class="bookings-header bg-block border-radius-lg">
      <h3 class="text-subtitle1 text-bold q-my-none">My Bookings</h3>
      <TabsComp
        size="sm"
        unelevated
        send-initial-tab
        :tabs="filterTabs"
        :activeTab="activeFilterTab"
        @set-active-tab="setActiveTab"
      />
    </div>

    <!-- Bookings List -->
    <div class="bookings-list">
      <!-- Sent Bookings -->
      <div v-if="activeFilterTab.tab === SENT_TAB" class="bookings-section">
        <div v-if="!sentBookings.length" class="empty-state">
          <q-icon name="send" size="48px" color="grey-6" />
          <p class="empty-text">No sent requests to shops yet</p>
          <p class="empty-subtext">When you send requests to shops, they will appear here</p>
        </div>

        <div v-else class="bookings-grid">
          <BookingCard
            v-for="booking in sentBookings"
            :key="booking.documentId"
            :booking="booking"
            @cancel="cancelBooking"
          />
        </div>
      </div>

      <!-- Received Bookings -->
      <div v-if="activeFilterTab.tab === RECEIVED_TAB" class="bookings-section">
        <div v-if="!receivedBookings.length" class="empty-state">
          <q-icon name="inbox" size="48px" color="grey-6" />
          <p class="empty-text">No invitations from shops yet</p>
          <p class="empty-subtext">When shops send you invitations, they will appear here</p>
        </div>

        <div v-else class="bookings-grid">
          <BookingCard
            v-for="booking in receivedBookings"
            :key="booking.documentId"
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
import BookingCard from 'src/components/Bookings/Shop/BookingCard.vue';
import TabsComp from 'src/components/TabsComp.vue';
import type { ITab } from 'src/interfaces/tabs';

const $q = useQuasar();

// State
const bookings = ref<IBooking[]>([]);

// Filter tabs
const SENT_TAB = 'sent';
const RECEIVED_TAB = 'received';

// Computed properties
const sentBookings = computed(() => {
  return bookings.value.filter((booking) => booking.type === 'artist-to-shop');
});

const receivedBookings = computed(() => {
  return bookings.value.filter((booking) => booking.type === 'shop-to-artist');
});

const filterTabs = computed<ITab[]>(() => [
  { label: 'Sent', tab: SENT_TAB, count: sentBookings.value.length },
  { label: 'Received', tab: RECEIVED_TAB, count: receivedBookings.value.length },
]);

const activeFilterTab = ref<ITab>(filterTabs.value[0]!);

// Methods
const setActiveTab = (t: ITab) => {
  activeFilterTab.value = t;
};

const acceptBooking = (bookingDocumentId: string) => {
  const booking = bookings.value.find((b) => b.documentId === bookingDocumentId);
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
        },
      ],
    });
  }
};

const rejectBooking = (bookingDocumentId: string) => {
  const booking = bookings.value.find((b) => b.documentId === bookingDocumentId);
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
        },
      ],
    });
  }
};

const cancelBooking = (bookingDocumentId: string) => {
  $q.dialog({
    title: 'Cancel Booking',
    message: 'Are you sure you want to cancel this booking request?',
    cancel: {
      color: 'grey-9',
      rounded: true,
      label: 'No, Keep It',
    },
    ok: {
      color: 'negative',
      rounded: true,
      label: 'Yes, Cancel',
    },
  }).onOk(() => {
    const booking = bookings.value.find((b) => b.documentId === bookingDocumentId);
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
          },
        ],
      });
    }
  });
};

// Load mock data on mount
onMounted(() => {
  // Mock data for demonstration
  bookings.value = [
    {
      documentId: '1',
      title: 'Tattoo Session Request',
      description: 'I would like to visit your shop and ...',
      shopDocumentId: '1',
      artistDocumentId: '2',
      location: '123 Main St, Anytown, USA',
      startTime: '10:00',
      endTime: '14:00',
      date: '2024-02-15',
      status: 'pending',
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z',
      type: 'shop-to-artist',
      artist: {
        documentId: '2',
        name: 'John Doe',
        avatar: {
          url: 'artists/artist1.jpeg',
        },
        experience: 10,
      },
    },
    {
      documentId: '2',
      title: 'Art Commission',
      description: 'Need artwork for shop decoration',
      shopDocumentId: '3',
      artistDocumentId: '1',
      location: '123 Main St, Anytown, USA',
      startTime: '09:00',
      endTime: '17:00',
      date: '2024-02-20',
      status: 'accepted',
      createdAt: '2024-01-18T14:00:00Z',
      updatedAt: '2024-01-19T09:00:00Z',
      type: 'artist-to-shop',
      artist: {
        documentId: '4',
        name: 'John Doe',
        avatar: {
          url: 'artists/artist2.jpg',
        },
        experience: 3,
      },
    },
    {
      documentId: '3',
      title: 'Tattoo Session',
      description: 'Looking for a skilled artist for a custom tattoo design',
      shopDocumentId: '3',
      artistDocumentId: '1',
      location: '123 Main St, Anytown, USA',
      startTime: '09:00',
      endTime: '17:00',
      date: '2024-02-20',
      status: 'pending',
      createdAt: '2024-01-18T14:00:00Z',
      updatedAt: '2024-01-19T09:00:00Z',
      type: 'artist-to-shop',
      artist: {
        documentId: '4',
        name: 'John Doe',
        avatar: {
          url: 'artists/artist3.jpg',
        },
        experience: 3,
      },
    },
    {
      documentId: '4',
      title: 'Art Commission',
      description: 'Need artwork for shop decoration',
      shopDocumentId: '3',
      artistDocumentId: '1',
      location: '123 Main St, Anytown, USA',
      startTime: '09:00',
      endTime: '17:00',
      date: '2024-02-20',
      status: 'rejected',
      createdAt: '2024-01-18T14:00:00Z',
      updatedAt: '2024-01-19T09:00:00Z',
      type: 'artist-to-shop',
      artist: {
        documentId: '6',
        name: 'John Doe',
        avatar: {
          url: 'artists/artist4.jpg',
        },
        experience: 5,
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
    padding: 4px 4px 4px 16px;
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
