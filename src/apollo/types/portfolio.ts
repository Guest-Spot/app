import { gql } from '@apollo/client/core';

export const PORTFOLIO_QUERY = gql`
  query Portfolio($documentId: String!) {
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
