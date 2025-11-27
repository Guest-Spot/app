import { gql } from '@apollo/client/core';

export const OPENING_HOURS_QUERY = gql`
  query OpeningHours($filters: OpeningHourFiltersInput) {
    openingHours(filters: $filters) {
      documentId
      start
      end
      day
    }
  }
`;
