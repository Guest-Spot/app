import { gql } from '@apollo/client/core';

export const TRIPS_QUERY = gql`
  query Trips($filters: TripFiltersInput) {
    trips(filters: $filters) {
      documentId
      name
      description
      ownerDocumentId
      location {
        city
        address
        latitude
        longitude
      }
      date
      startTime
      endTime
      createdAt
      updatedAt
      publishedAt
    }
  }
`;
