import { gql } from '@apollo/client/core';

export const UPDATE_GUEST_MUTATION = gql`
  mutation UpdateGuest($documentId: ID!, $data: GuestInput!) {
    updateGuest(documentId: $documentId, data: $data) {
      documentId
      name
      email
      avatar {
        documentId
        url
      }
    }
  }
`;
