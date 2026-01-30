import { gql } from '@apollo/client/core';

export const GUEST_SPOT_SLOTS_QUERY = gql`
  query GuestSpotSlots(
    $filters: GuestSpotSlotFiltersInput
    $sort: [String!]
    $pagination: PaginationArg
  ) {
    guestSpotSlots(filters: $filters, sort: $sort, pagination: $pagination) {
      documentId
      enabled
      title
      description
      pricingOptions {
        type
        amount
        description
      }
      depositAmount
      spaces
      openingHours {
        id
        day
        start
        end
      }
      createdAt
      updatedAt
      shop {
        documentId
        name
        city
        country
        state
        address
        avatar {
          id
          documentId
          url
        }
        pictures {
          id
          documentId
          url
        }
        verified
      }
    }
  }
`;

export const GUEST_SPOT_SLOT_QUERY = gql`
  query GuestSpotSlot($documentId: ID!) {
    guestSpotSlot(documentId: $documentId) {
      documentId
      enabled
      title
      description
      pricingOptions {
        type
        amount
        description
      }
      depositAmount
      spaces
      openingHours {
        id
        day
        start
        end
      }
      createdAt
      updatedAt
      shop {
        documentId
        name
        city
        country
        state
        address
        avatar {
          id
          documentId
          url
        }
        pictures {
          id
          documentId
          url
        }
        verified
      }
    }
  }
`;

export const GUEST_SPOT_BOOKINGS_QUERY = gql`
  query GuestSpotBookings(
    $filters: GuestSpotBookingFiltersInput
    $sort: [String!]
    $pagination: PaginationArg
  ) {
    guestSpotBookings(filters: $filters, sort: $sort, pagination: $pagination) {
      documentId
      status
      selectedDate
      selectedTime
      comment
      rejectNote
      depositAmount
      depositAuthorized
      depositAuthorizedAt
      depositCaptured
      platformCommissionAmount
      platformCommissionPaid
      paymentIntentId
      createdAt
      updatedAt
      artist {
        documentId
        name
        email
        city
        experience
        verified
        avatar {
          id
          documentId
          url
        }
      }
      shop {
        documentId
        name
        city
        country
        state
        address
        avatar {
          id
          documentId
          url
        }
        pictures {
          id
          documentId
          url
        }
        verified
      }
      slot {
        documentId
        title
        description
        pricingOptions {
          type
          amount
          description
        }
        depositAmount
        spaces
        openingHours {
          id
          day
          start
          end
        }
      }
    }
  }
`;

/** Separate query for availability check so Vue Apollo delivers result to the correct onResult (same document used in 3 useLazyQuery otherwise triggers only one callback). */
export const GUEST_SPOT_AVAILABILITY_BOOKINGS_QUERY = gql`
  query GuestSpotBookingsForAvailability(
    $filters: GuestSpotBookingFiltersInput
    $sort: [String!]
    $pagination: PaginationArg
  ) {
    guestSpotBookings(filters: $filters, sort: $sort, pagination: $pagination) {
      documentId
      status
      selectedDate
      slot {
        documentId
      }
    }
  }
`;

export const GUEST_SPOT_BOOKING_QUERY = gql`
  query GuestSpotBooking($documentId: ID!) {
    guestSpotBooking(documentId: $documentId) {
      documentId
      status
      selectedDate
      selectedTime
      comment
      rejectNote
      depositAmount
      depositAuthorized
      depositAuthorizedAt
      depositCaptured
      platformCommissionAmount
      platformCommissionPaid
      paymentIntentId
      createdAt
      updatedAt
      artist {
        documentId
        name
        email
        city
        experience
        verified
        avatar {
          id
          documentId
          url
        }
      }
      shop {
        documentId
        name
        city
        country
        state
        address
        avatar {
          id
          documentId
          url
        }
        pictures {
          id
          documentId
          url
        }
        verified
      }
      slot {
        documentId
        title
        description
        pricingOptions {
          type
          amount
          description
        }
        depositAmount
        spaces
        openingHours {
          id
          day
          start
          end
        }
      }
    }
  }
`;
