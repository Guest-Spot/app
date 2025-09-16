import { gql } from '@apollo/client/core';

export const SHOPS_QUERY = gql`
  query Shops($filters: ShopFiltersInput, $sort: [String], $pagination: PaginationArg) {
    shops_connection {
      pageInfo {
        total
      }
    }
    shops(filters: $filters, sort: $sort, pagination: $pagination) {
      documentId
      name
      description
      pictures {
        url
      }
      phone
      email
      links {
        type
        value
      }
      city
      address
      link
      openingHours {
        day
        start
        end
      }
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

export const SHOP_QUERY = gql`
  query Shop($documentId: ID!) {
    shop(documentId: $documentId) {
      documentId
      name
      description
      pictures {
        url
      }
      phone
      email
      links {
        type
        value
      }
      link
      city
      address
      openingHours {
        day
        start
        end
      }
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

export const SHOP_ARTISTS_QUERY = gql`
  query ShopArtists($documentId: ID!) {
    shopArtists(documentId: $documentId) {
      documentId
      name
      description
      experience
      avatar {
        url
      }
      links {
        type
        value
      }
      location {
        city
        address
        latitude
        longitude
      }
      phone
      email
      createdAt
      updatedAt
      publishedAt
    }
  }
`;
