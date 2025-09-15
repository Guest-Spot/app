import { gql } from '@apollo/client/core';

export const DELETE_IMAGE_MUTATION = gql`
  mutation DeleteUploadFile($id: ID!) {
    deleteUploadFile(id: $id) {
      documentId
    }
  }
`;
