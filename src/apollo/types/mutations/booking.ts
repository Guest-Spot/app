import { gql } from '@apollo/client/core';

export const CREATE_BOOKING_MUTATION = gql`
  mutation CreateBooking($data: BookingInput!) {
    createBooking(data: $data) {
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
      references {
        url
      }
      artist {
        documentId
        name
      }
      owner {
        documentId
        name
        avatar {
          url
        }
      }
    }
  }
`;

export const UPDATE_BOOKING_MUTATION = gql`
  mutation UpdateBooking($documentId: ID!, $data: BookingInput!) {
    updateBooking(documentId: $documentId, data: $data) {
      documentId
    }
  }
`;
