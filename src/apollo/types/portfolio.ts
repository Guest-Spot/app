import { gql } from '@apollo/client/core';

export const PORTFOLIOS_QUERY = gql`
  query Portfolios($filters: PortfolioFiltersInput) {
    portfolios(filters: $filters) {
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
      publishedAt
    }
  }
`;

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
