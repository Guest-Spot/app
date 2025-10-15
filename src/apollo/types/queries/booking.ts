import { gql } from '@apollo/client/core';

export const BOOKINGS_QUERY = gql`
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
      artist {
        documentId
        name
        city
        experience
        avatar {
          url
        }
      }
      owner {
        documentId
        name
      }
    }
  }
`;

