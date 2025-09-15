import { gql } from '@apollo/client/core';

export const UPDATE_SHOP_MUTATION = gql`
  mutation UpdateShop($documentId: ID!, $data: ShopInput!) {
    updateShop(documentId: $documentId, data: $data) {
      documentId
      name
      pictures {
        documentId
        url
      }
      description
      city
      address
      link
      phone
      email
      openingHours {
        day
        start
        end
      }
    }
  }
`;
