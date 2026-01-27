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
      guestSpotSlotDocumentId
      artistDocumentId
      shopDocumentId
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
        description
        pricingOptions {
          type
          amount
          description
        }
        depositAmount
        spaces
        openingHours {
          documentId
          day
          start
          end
        }
      }
    }
  }
`;

export const GUEST_SPOT_BOOKING_QUERY = gql`
  query GuestSpotBooking($documentId: ID!) {
    guestSpotBooking(documentId: $documentId) {
      documentId
      guestSpotSlotDocumentId
      artistDocumentId
      shopDocumentId
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
        description
        pricingOptions {
          type
          amount
          description
        }
        depositAmount
        spaces
        openingHours {
          documentId
          day
          start
          end
        }
      }
    }
  }
`;
