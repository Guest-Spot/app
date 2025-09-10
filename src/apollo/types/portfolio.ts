import { gql } from '@apollo/client/core';

export const PORTFOLIO_QUERY = gql`
  query Portfolio($documentId: ID!) {
    portfolio(documentId: $documentId) {
      documentId
      title
      description
      pictures {
        url
      }
      tags {
        name
      }
      ownerDocumentId
      createdAt
      updatedAt
    }
  }
`;
