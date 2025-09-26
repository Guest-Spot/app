import { gql } from '@apollo/client/core';

export const NOTIFICATIONS_QUERY = gql`
  query Notifies($filters: NotifyFiltersInput, $sort: [String!]) {
    notifies(filters: $filters, sort: $sort) {
      documentId
      ownerDocumentId
      type
      recipientDocumentId
      createdAt
      updatedAt
      publishedAt
    }
  }
`;
