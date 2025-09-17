import { gql } from '@apollo/client/core';

export const UPDATE_ARTIST_MUTATION = gql`
  mutation UpdateArtist($documentId: ID!, $data: ArtistInput!) {
    updateArtist(documentId: $documentId, data: $data) {
      documentId
      name
      description
      phone
      email
      avatar {
        documentId
        url
      }
    }
  }
`;
