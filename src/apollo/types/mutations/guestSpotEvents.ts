import { gql } from '@apollo/client/core';

export const CREATE_GUEST_SPOT_EVENT_MUTATION = gql`
  mutation CreateGuestSpotEvent($data: GuestSpotEventInput!) {
    createGuestSpotEvent(data: $data) {
      data {
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
      }
    }
  }
`;
