import { gql } from '@apollo/client/core';

export const INVITE_ARTIST_MUTATION = gql`
  mutation InviteArtist($data: BookingInput!) {
    createBooking(data: $data) {
      documentId
      title
      description
      shopDocumentId
      artistDocumentId
      status
      type
      createdAt
      updatedAt
      artist {
        documentId
        name
        avatar {
          url
        }
      }
      shop {
        documentId
        name
        pictures {
          url
        }
      }
    }
  }
`;
