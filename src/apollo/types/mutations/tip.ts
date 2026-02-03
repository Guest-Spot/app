import { gql } from '@apollo/client/core';

export const CREATE_TIP_PAYMENT_MUTATION = gql`
  mutation CreateTipPayment($artistDocumentId: ID!, $tipPresetId: ID!, $customerEmail: String) {
    createTipPayment(
      artistDocumentId: $artistDocumentId
      tipPresetId: $tipPresetId
      customerEmail: $customerEmail
    ) {
      sessionId
      sessionUrl
    }
  }
`;
