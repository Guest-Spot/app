import { gql } from '@apollo/client/core';

export const PORTFOLIOS_QUERY = gql`
  query Portfolios($filters: PortfolioFiltersInput, $sort: [String], $pagination: PaginationArg) {
    portfolios_connection(filters: $filters, sort: $sort, pagination: $pagination) {
      pageInfo {
        total
      }
    }
    portfolios(filters: $filters, sort: $sort, pagination: $pagination) {
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
      owner {
        documentId
        name
        type
        city
        address
        verified
        avatar {
          id
          url
        }
        pictures {
          id
          url
        }
      }
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
      owner {
        documentId
        name
        type
        city
        address
        verified
      }
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
      owner {
        documentId
        name
        type
        city
        address
        verified
      }
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
      owner {
        documentId
        name
        type
        city
        address
        verified
      }
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
