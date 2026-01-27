import { gql } from '@apollo/client/core';

export const GUEST_SPOT_EVENTS_QUERY = gql`
  query GuestSpotEvents(
    $filters: GuestSpotEventFiltersInput
    $sort: [String!]
    $pagination: PaginationArg
  ) {
    guestSpotEvents(filters: $filters, sort: $sort, pagination: $pagination) {
      documentId
      type
      title
      description
      shopDocumentId
      artistDocumentId
      guestSpotSlotDocumentId
      guestSpotBookingDocumentId
      createdAt
      updatedAt
      publishedAt
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
          id
          day
          start
          end
        }
      }
      booking {
        documentId
        status
        selectedDate
        selectedTime
        depositAmount
        platformCommissionAmount
      }
    }
  }
`;

export const GUEST_SPOT_EVENT_QUERY = gql`
  query GuestSpotEvent($documentId: ID!) {
    guestSpotEvent(documentId: $documentId) {
      documentId
      type
      title
      description
      shopDocumentId
      artistDocumentId
      guestSpotSlotDocumentId
      guestSpotBookingDocumentId
      createdAt
      updatedAt
      publishedAt
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
          id
          day
          start
          end
        }
      }
      booking {
        documentId
        status
        selectedDate
        selectedTime
        depositAmount
        platformCommissionAmount
      }
    }
  }
`;
