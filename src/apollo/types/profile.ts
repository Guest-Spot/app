import { gql } from '@apollo/client/core';

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($documentId: ID!, $data: ProfileInput!) {
    updateProfile(documentId: $documentId, data: $data) {
      documentId
      website
      links {
        type
        value
      }
      lat
      lng
    }
  }
`;

