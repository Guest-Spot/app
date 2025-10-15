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
    }
  }
`;
