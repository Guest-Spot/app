import { gql } from '@apollo/client/core';

export const OPENING_HOURS_QUERY = gql`
  query OpeningHours {
    openingHours {
      documentId
      start
      end
      day
    }
  }
`;
