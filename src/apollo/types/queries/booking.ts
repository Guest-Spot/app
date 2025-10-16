import { gql } from '@apollo/client/core';

export const BOOKINGS_QUERY = gql`
  query Bookings($filters: BookingFiltersInput) {
    bookings(filters: $filters) {
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
      rejectNote
      references {
        url
      }
      artist {
        documentId
        name
        city
        experience
        avatar {
          url
        }
        parent {
          documentId
          name
        }
      }
      owner {
        documentId
        name
      }
    }
  }
`;
