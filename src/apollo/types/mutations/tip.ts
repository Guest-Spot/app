import { gql } from '@apollo/client/core';

export const CREATE_TIP_PAYMENT_MUTATION = gql`
  mutation CreateTipPayment($artistDocumentId: ID!, $amount: Int!, $customerEmail: String) {
    createTipPayment(
      artistDocumentId: $artistDocumentId
      amount: $amount
      customerEmail: $customerEmail
    ) {
      sessionId
      sessionUrl
    }
  }
`;
