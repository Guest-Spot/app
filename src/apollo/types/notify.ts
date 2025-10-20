import { gql } from '@apollo/client/core';

export const NOTIFICATIONS_QUERY = gql`
  query Notifies($filters: NotifyFiltersInput, $sort: [String!], $pagination: PaginationArg) {
    notifies(filters: $filters, sort: $sort, pagination: $pagination) {
      documentId
      ownerDocumentId
      type
      recipientDocumentId
      body
      createdAt
      updatedAt
      publishedAt
    }
  }
`;
