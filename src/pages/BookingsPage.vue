<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <template v-if="isAuthenticated">
      <!-- Main Content Area -->
      <div class="container">
        <div class="main-content flex column q-gap-md">
          <div class="tab-content">
            <BookingCalendar :bookings="mockBookings" :loading="isLoading" />
          </div>
        </div>
      </div>
    </template>

    <SingInToContinue v-else class="fixed-center full-width" title="My Bookings" />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BookingCalendar } from 'src/components';
import SingInToContinue from 'src/components/SingInToContinue.vue';
import useUser from 'src/modules/useUser';
import type { IBooking } from 'src/interfaces/booking';

const { isAuthenticated } = useUser();

const isLoading = ref(false);

// Mock bookings for tattoo sessions demo
const mockBookings = ref<IBooking[]>([
  {
    documentId: '1',
    title: 'Dragon Sleeve Tattoo',
    description: 'Traditional Japanese dragon sleeve on right arm. Client wants vibrant colors with detailed scales and clouds.',
    shopDocumentId: 'shop1',
    artistDocumentId: 'artist1',
    startTime: '10:00:00',
    endTime: '14:00:00',
    date: '2024-10-15',
    location: 'Ink Masters Studio, Downtown',
    status: 'accepted',
    type: 'shop-to-artist',
    createdAt: '2024-10-01T10:00:00Z',
    updatedAt: '2024-10-01T10:00:00Z',
    artist: {
      documentId: 'artist1',
      name: 'Alex Ink',
      avatar: {
        id: 'avatar1',
        url: '/artists/artist1.jpeg',
      },
    },
  },
  {
    documentId: '2',
    title: 'Geometric Mandala Back Piece',
    description: 'Large geometric mandala design covering upper back. Black and grey with dotwork details.',
    shopDocumentId: 'shop1',
    artistDocumentId: 'artist2',
    startTime: '13:00:00',
    endTime: '18:00:00',
    date: '2024-10-16',
    location: 'Urban Tattoo Parlor',
    status: 'accepted',
    type: 'shop-to-artist',
    createdAt: '2024-10-02T10:00:00Z',
    updatedAt: '2024-10-02T10:00:00Z',
    artist: {
      documentId: 'artist2',
      name: 'Maria Santos',
      avatar: {
        id: 'avatar2',
        url: '/artists/artist2.jpg',
      },
    },
  },
  {
    documentId: '3',
    title: 'Rose Bouquet Thigh Piece',
    description: 'Realistic rose bouquet on left thigh with soft shading and color highlights.',
    shopDocumentId: 'shop1',
    artistDocumentId: 'artist3',
    startTime: '11:00:00',
    endTime: '15:00:00',
    date: '2024-10-17',
    location: 'The Tattoo Lounge',
    status: 'pending',
    type: 'shop-to-artist',
    createdAt: '2024-10-03T10:00:00Z',
    updatedAt: '2024-10-03T10:00:00Z',
    artist: {
      documentId: 'artist3',
      name: 'Viktor Stone',
      avatar: {
        id: 'avatar3',
        url: '/artists/artist3.jpg',
      },
    },
  },
  {
    documentId: '4',
    title: 'Portrait Tattoo Session',
    description: 'Black and grey portrait of grandmother on shoulder blade. Photo reference provided.',
    shopDocumentId: 'shop1',
    artistDocumentId: 'artist4',
    startTime: '09:00:00',
    endTime: '13:00:00',
    date: '2024-10-20',
    location: 'Legacy Ink Studio',
    status: 'accepted',
    type: 'shop-to-artist',
    createdAt: '2024-10-04T10:00:00Z',
    updatedAt: '2024-10-04T10:00:00Z',
    artist: {
      documentId: 'artist4',
      name: 'Sarah Chen',
      avatar: {
        id: 'avatar4',
        url: '/artists/artist4.jpg',
      },
    },
  },
  {
    documentId: '5',
    title: 'Minimalist Line Art',
    description: 'Simple continuous line drawing of a mountain range on forearm. Clean and minimal aesthetic.',
    shopDocumentId: 'shop1',
    artistDocumentId: 'artist5',
    startTime: '14:00:00',
    endTime: '16:00:00',
    date: '2024-10-21',
    location: 'Minimal Tattoo Collective',
    status: 'accepted',
    type: 'shop-to-artist',
    createdAt: '2024-10-05T10:00:00Z',
    updatedAt: '2024-10-05T10:00:00Z',
    artist: {
      documentId: 'artist5',
      name: 'Leo Martinez',
      avatar: {
        id: 'avatar5',
        url: 'https://i.pravatar.cc/150?img=12',
      },
    },
  },
  {
    documentId: '6',
    title: 'Traditional Anchor & Rope',
    description: 'Old school traditional anchor with rope on calf. Bold lines and classic sailor tattoo style.',
    shopDocumentId: 'shop1',
    artistDocumentId: 'artist6',
    startTime: '16:00:00',
    endTime: '18:30:00',
    date: '2024-10-21',
    location: 'Sailor Jerry Tattoos',
    status: 'completed',
    type: 'shop-to-artist',
    createdAt: '2024-10-06T10:00:00Z',
    updatedAt: '2024-10-21T18:30:00Z',
    artist: {
      documentId: 'artist6',
      name: 'Mike "Sailor" Johnson',
      avatar: {
        id: 'avatar6',
        url: 'https://i.pravatar.cc/150?img=33',
      },
    },
  },
  {
    documentId: '7',
    title: 'Watercolor Phoenix',
    description: 'Vibrant watercolor style phoenix rising from ashes on ribcage. Lots of color blending.',
    shopDocumentId: 'shop1',
    artistDocumentId: 'artist7',
    startTime: '10:00:00',
    endTime: '15:00:00',
    date: '2024-10-23',
    location: 'Color Splash Tattoo',
    status: 'accepted',
    type: 'shop-to-artist',
    createdAt: '2024-10-07T10:00:00Z',
    updatedAt: '2024-10-07T10:00:00Z',
    artist: {
      documentId: 'artist7',
      name: 'Emma Waterhouse',
      avatar: {
        id: 'avatar7',
        url: 'https://i.pravatar.cc/150?img=47',
      },
    },
  },
  {
    documentId: '8',
    title: 'Biomechanical Arm Piece',
    description: 'Detailed biomechanical design showing gears and machinery under skin on forearm.',
    shopDocumentId: 'shop1',
    artistDocumentId: 'artist8',
    startTime: '11:00:00',
    endTime: '16:00:00',
    date: '2024-10-24',
    location: 'Cyborg Ink',
    status: 'pending',
    type: 'shop-to-artist',
    createdAt: '2024-10-08T10:00:00Z',
    updatedAt: '2024-10-08T10:00:00Z',
    artist: {
      documentId: 'artist8',
      name: 'James "Cyber" Wright',
      avatar: {
        id: 'avatar8',
        url: 'https://i.pravatar.cc/150?img=52',
      },
    },
  },
  {
    documentId: '9',
    title: 'Celtic Knot Band',
    description: 'Traditional Celtic knot armband around bicep. Intricate knotwork in black ink.',
    shopDocumentId: 'shop1',
    artistDocumentId: 'artist9',
    startTime: '13:00:00',
    endTime: '15:30:00',
    date: '2024-10-27',
    location: 'Celtic Heritage Tattoo',
    status: 'pending',
    type: 'shop-to-artist',
    createdAt: '2024-10-09T10:00:00Z',
    updatedAt: '2024-10-09T10:00:00Z',
    artist: {
      documentId: 'artist9',
      name: 'Connor O\'Brien',
      avatar: {
        id: 'avatar9',
        url: 'https://i.pravatar.cc/150?img=68',
      },
    },
  },
]);
</script>

<style scoped lang="scss">
.tab-content {
  min-height: 400px;
}
</style>
