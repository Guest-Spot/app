import { gql } from '@apollo/client/core';

export const UPDATE_SHOP_MUTATION = gql`
  mutation UpdateShop($documentId: ID!, $data: ShopInput!) {
    updateShop(documentId: $documentId, data: $data) {
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
      email
      createdAt
      updatedAt
      publishedAt
    }
  }
`;
