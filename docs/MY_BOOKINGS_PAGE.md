# My Bookings Page - Guest User Bookings

## Overview

The My Bookings page (`MyBookingsPage.vue`) is a dedicated page for Guest users to view and manage their booking requests to artists.

## Features

- **Guest-only access**: Only authenticated users with Guest role can access this page
- **Booking list view**: Displays all booking requests made by the guest user
- **Detailed view**: Click on any booking to see full details in a dialog
- **Real-time data**: Uses GraphQL to fetch the latest booking information

## Route

```
/my-bookings
```

## Components

### Main Page Component

- **Location**: `src/pages/MyBookingsPage.vue`
- **Purpose**: Main page container with authentication and role checks

### Guest Components

All guest booking components are located in `src/components/Bookings/Guest/`:

1. **GuestBookingsList.vue**
   - Fetches and displays list of bookings
   - Handles loading and empty states
   - Opens detail dialog on booking click
   - Uses shared `BookingDetailsDialog` from `src/components/Dialogs/`

2. **GuestBookingCard.vue**
   - Individual booking card component
   - Shows booking summary information
   - Displays reaction status badge (Pending, Accepted, Rejected)
   - Displays date, time, location, and tattoo details (placement, size)
   - Shows reference images count
   - Styled consistently with other booking cards in the app

## GraphQL Integration

### Query

Located in: `src/apollo/types/queries/booking.ts`

```graphql
query Bookings {
  bookings {
    documentId
    name
    email
    phone
    location
    description
    placement
    size
    day
    start
    reaction
    references {
      url
    }
    artist
    owner
  }
}
```

**Note:** `artist` and `owner` fields return document IDs (strings), not full user objects.

## Data Types

New interfaces added to `src/interfaces/booking.ts`:

- **IBooking**: Represents a guest's booking request with fields:
  - Basic info: `documentId`, `name`, `email`, `phone`
  - Booking details: `location`, `description`, `placement`, `size`
  - Date/time: `day`, `start`
  - Status: `reaction` (EReactions enum: Pending, Accepted, Rejected)
  - References: `references` array with image URLs
  - Relations: `artist` and `owner` (document IDs as strings)
  
- **IBookingsQueryResponse**: Response type for the bookings query

- **EReactions** (enum from `src/interfaces/enums.ts`):
  - `Pending`: Request is awaiting response
  - `Accepted`: Request was accepted by artist
  - `Rejected`: Request was rejected by artist

## Access Control

The page implements three access states:

1. **Not Authenticated**: Shows sign-in prompt
2. **Not a Guest**: Shows access restricted message
3. **Authenticated Guest**: Shows full booking list functionality

## Usage

For Guest users:
1. Navigate to `/my-bookings`
2. View your booking requests
3. Click on any booking to see full details
4. Close detail dialog to return to list

## Future Enhancements

Potential features to add:
- Filter bookings by status (pending, accepted, rejected)
- Sort bookings by date
- Cancel booking functionality
- Edit booking details
- Real-time notifications for booking status changes

