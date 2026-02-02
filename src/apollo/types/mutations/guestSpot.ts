import { gql } from '@apollo/client/core';

export const CREATE_GUEST_SPOT_SLOT_MUTATION = gql`
  mutation CreateGuestSpotSlot($data: GuestSpotSlotInput!) {
    createGuestSpotSlot(data: $data) {
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
    }
  }
`;

export const UPDATE_GUEST_SPOT_SLOT_MUTATION = gql`
  mutation UpdateGuestSpotSlot($documentId: ID!, $data: GuestSpotSlotInput!) {
    updateGuestSpotSlot(documentId: $documentId, data: $data) {
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
    }
  }
`;

export const DELETE_GUEST_SPOT_SLOT_MUTATION = gql`
  mutation DeleteGuestSpotSlot($documentId: ID!) {
    deleteGuestSpotSlot(documentId: $documentId) {
      documentId
    }
  }
`;

export const TOGGLE_GUEST_SPOT_ENABLED_MUTATION = gql`
  mutation ToggleGuestSpotEnabled($shopDocumentId: ID!, $enabled: Boolean!) {
    toggleGuestSpotEnabled(shopDocumentId: $shopDocumentId, enabled: $enabled) {
      documentId
      guestSpotEnabled
    }
  }
`;

export const CREATE_GUEST_SPOT_BOOKING_MUTATION = gql`
  mutation CreateGuestSpotBooking($data: CreateGuestSpotBookingInput!) {
    createGuestSpotBooking(data: $data) {
      data {
        documentId
        status
        selectedDate
        selectedTime
        comment
        depositAmount
        platformCommissionAmount
        platformCommissionPaid
        createdAt
        artist {
          documentId
          name
          avatar {
            id
            documentId
            url
          }
        }
        shop {
          documentId
          name
          avatar {
            id
            documentId
            url
          }
        }
        slot {
          documentId
          description
          depositAmount
        }
      }
    }
  }
`;

export const APPROVE_GUEST_SPOT_BOOKING_MUTATION = gql`
  mutation ApproveGuestSpotBooking($documentId: ID!) {
    approveGuestSpotBooking(documentId: $documentId) {
      data {
        documentId
        status
        updatedAt
      }
    }
  }
`;

export const REJECT_GUEST_SPOT_BOOKING_MUTATION = gql`
  mutation RejectGuestSpotBooking($documentId: ID!, $rejectNote: String) {
    rejectGuestSpotBooking(documentId: $documentId, rejectNote: $rejectNote) {
      data {
        documentId
        status
        rejectNote
        updatedAt
      }
    }
  }
`;

export const CREATE_GUEST_SPOT_DEPOSIT_MUTATION = gql`
  mutation CreateGuestSpotDeposit($bookingId: ID!, $customerEmail: String) {
    createGuestSpotDeposit(bookingId: $bookingId, customerEmail: $customerEmail) {
      booking {
        data {
          documentId
        }
      }
      sessionId
      sessionUrl
      paymentIntentId
    }
  }
`;

export const CAPTURE_GUEST_SPOT_DEPOSIT_MUTATION = gql`
  mutation CaptureGuestSpotDeposit($bookingId: ID!) {
    captureGuestSpotDeposit(bookingId: $bookingId) {
      documentId
      depositCaptured
      depositAuthorized
      updatedAt
    }
  }
`;

export const RELEASE_GUEST_SPOT_DEPOSIT_MUTATION = gql`
  mutation ReleaseGuestSpotDeposit($bookingId: ID!) {
    releaseGuestSpotDeposit(bookingId: $bookingId) {
      documentId
      depositAuthorized
      depositCaptured
      updatedAt
    }
  }
`;
