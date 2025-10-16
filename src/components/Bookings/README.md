# Booking Components

This directory contains components related to booking management in the GuestSpot application.

## BookingCalendar Component

A calendar-style view for displaying tattoo session bookings organized by date and week.

### Features

- **Calendar View**: Displays tattoo bookings in a monthly calendar format
- **Week Grouping**: Automatically groups bookings by weeks with labeled separators
- **Color-Coded Status**: Different colors for booking statuses (accepted, pending, rejected, etc.)
- **Artist Information**: Shows artist avatar, name, and session start time in each card
- **Details Button**: Dedicated button to view complete booking information
- **Detailed View**: Comprehensive dialog showing tattoo description, session details, artist info, and location
- **Navigation**: Month navigation with previous/next buttons and "Go to Today" quick action
- **Responsive**: Adapts to different screen sizes
- **Dark Mode Support**: Fully styled for both light and dark themes

### Usage

```vue
<template>
  <BookingCalendar :bookings="bookings" :loading="isLoading" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BookingCalendar } from 'src/components';
import type { IBooking } from 'src/interfaces/booking';

const bookings = ref<IBooking[]>([...]);
const isLoading = ref(false);
</script>
```

### Props

| Prop       | Type         | Default | Description                                         |
| ---------- | ------------ | ------- | --------------------------------------------------- |
| `bookings` | `IBooking[]` | `[]`    | Array of booking objects to display in the calendar |
| `loading`  | `boolean`    | `false` | Shows loading spinner when true                     |

### Booking Object Structure

The component expects bookings to follow the `IBooking` interface. For tattoo sessions:

```typescript
interface IBooking {
  documentId: string;
  title: string; // Tattoo title (e.g., "Dragon Sleeve Tattoo")
  description: string; // Detailed description of the tattoo
  date: string; // Format: YYYY-MM-DD or ISO date string
  startTime: string; // Session start time (Format: HH:mm:ss)
  endTime: string; // Session end time (Format: HH:mm:ss)
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  location?: string; // Shop/studio location
  artist?: {
    documentId: string;
    name: string;
    avatar?: {
      id: string;
      url: string;
    };
  };
  // ... other fields
}
```

### Example Booking Data

```javascript
{
  documentId: '1',
  title: 'Dragon Sleeve Tattoo',
  description: 'Traditional Japanese dragon sleeve on right arm. Client wants vibrant colors with detailed scales and clouds.',
  startTime: '10:00:00',
  endTime: '14:00:00',
  date: '2024-10-15',
  location: 'Ink Masters Studio, Downtown',
  status: 'accepted',
  type: 'shop-to-artist',
  artist: {
    documentId: 'artist1',
    name: 'Alex Ink',
    avatar: {
      id: 'avatar1',
      url: '/artists/artist1.jpeg',
    },
  },
}
```

### Status Colors

- **Accepted**: Blue (`#31ccec`)
- **Pending**: Orange/Warning (`#f2c037`)
- **Rejected/Cancelled**: Red/Negative (`#c10015`)
- **Completed**: Green/Positive (`#21ba45`)

### Interaction

**Card View:**

- Each booking card displays:
  - Artist avatar (or placeholder if not available)
  - Tattoo session title
  - Artist name
  - Session start time
  - Status indicator (for pending, rejected, cancelled, or completed)
  - "Details" button for viewing full information

**Details Dialog:**
When clicking the "Details" button, a comprehensive dialog appears showing:

- Session title and status
- Artist information with "View Profile" link
- Session details (date, time range, location)
- Complete tattoo description

No external events are emitted - all interactions are handled internally.

### Styling

The component uses the application's color scheme and supports both light and dark themes. All styles are scoped to prevent conflicts.

### Example Implementation

See `/src/pages/BookingsPage.vue` for a complete implementation example with view toggling between list and calendar views.

## BookingDetailsDialog Component

A dedicated dialog component for displaying detailed booking information.

### Features

- **Professional Layout**: Clean, organized layout following app design patterns
- **Artist Card Integration**: Uses `ArtistCard` component for consistent artist display with avatar, name, location, and experience
- **InfoCard Components**: Uses `InfoCard` component for displaying session details and tattoo description in a structured, reusable format
- **Session Information**: Date, time, and location details displayed in InfoCard
- **Tattoo Description**: Full description section with expandable text support
- **Status Badge**: Color-coded status indicator
- **Interactive Artist**: Click on artist card to navigate to profile
- **Responsive**: Adapts to different screen sizes
- **Dark Mode**: Full support for light and dark themes

### Usage

```vue
<template>
  <BookingDetailsDialog v-model="showDialog" :booking="selectedBooking" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BookingDetailsDialog } from 'src/components/Dialogs';
import type { IBooking } from 'src/interfaces/booking';

const showDialog = ref(false);
const selectedBooking = ref<IBooking | null>(null);
</script>
```

### Props

| Prop         | Type               | Default | Description                           |
| ------------ | ------------------ | ------- | ------------------------------------- |
| `modelValue` | `boolean`          | -       | Controls dialog visibility (v-model)  |
| `booking`    | `IBooking \| null` | -       | Booking object to display details for |

### Events

| Event               | Payload   | Description                            |
| ------------------- | --------- | -------------------------------------- |
| `update:modelValue` | `boolean` | Emitted when dialog visibility changes |

## Other Components

- **BookingsList**: List view of bookings with filtering
- **BookingCard**: Individual booking card component
