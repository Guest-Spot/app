import { gql } from '@apollo/client/core';

export const CREATE_FEEDBACK_MUTATION = gql`
  mutation CreateFeedback($data: FeedbackInput!) {
    createFeedback(data: $data) {
      documentId
    }
  }
`;
