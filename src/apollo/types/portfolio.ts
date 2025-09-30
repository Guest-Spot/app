import { gql } from '@apollo/client/core';

export const PORTFOLIOS_QUERY = gql`
  query Portfolios($filters: PortfolioFiltersInput) {
    portfolios(filters: $filters) {
      documentId
      title
      description
      pictures {
        url
        id
      }
      tags {
        name
        id
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
        id
      }
      tags {
        name
        id
      }
      ownerDocumentId
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_PORTFOLIO_MUTATION = gql`
  mutation CreatePortfolio($data: PortfolioInput!) {
    createPortfolio(data: $data) {
      documentId
      title
      description
      pictures {
        url
        id
      }
      tags {
        name
        id
      }
      ownerDocumentId
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PORTFOLIO_MUTATION = gql`
  mutation UpdatePortfolio($documentId: ID!, $data: PortfolioInput!) {
    updatePortfolio(documentId: $documentId, data: $data) {
      documentId
      title
      description
      pictures {
        url
        id
      }
      tags {
        name
        id
      }
      ownerDocumentId
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PORTFOLIO_MUTATION = gql`
  mutation DeletePortfolio($documentId: ID!) {
    deletePortfolio(documentId: $documentId) {
      documentId
    }
  }
`;
