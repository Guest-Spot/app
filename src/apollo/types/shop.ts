import { gql } from "@apollo/client";

export const SHOPS_QUERY = gql`
  query Shops($filters: ShopFiltersInput, $sort: [String]) {
    shops(filters: $filters, sort: $sort) {
      name
      description
      pictures {
        url
      }
      phone
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
