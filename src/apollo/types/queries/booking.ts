import { gql } from '@apollo/client/core';

export const BOOKINGS_QUERY = gql`
  query Bookings(
    $filters: BookingFiltersInput
    $sort: [String!]
    $pagination: PaginationArg
  ) {
    bookings(filters: $filters, sort: $sort, pagination: $pagination) {
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
      paymentStatus
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
        depositAmount
        payoutsEnabled
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
        avatar {
          url
        }
      }
      createdAt
    }
  }
`;
