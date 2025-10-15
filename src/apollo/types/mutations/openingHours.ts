import { gql } from '@apollo/client/core';

export const CREATE_OPENING_HOUR_MUTATION = gql`
  mutation CreateOpeningHour($data: OpeningHourInput!) {
    createOpeningHour(data: $data) {
      documentId
      day
      start
      end
    }
  }
`;

export const UPDATE_OPENING_HOUR_MUTATION = gql`
  mutation UpdateOpeningHour($documentId: ID!, $data: OpeningHourInput!) {
    updateOpeningHour(documentId: $documentId, data: $data) {
      documentId
    }
  }
`;

export const DELETE_OPENING_HOUR_MUTATION = gql`
  mutation DeleteOpeningHour($documentId: ID!) {
    deleteOpeningHour(documentId: $documentId) {
      documentId
    }
  }
`;
