import { gql } from '@apollo/client/core';

export const GET_STRIPE_DASHBOARD_URL_MUTATION = gql`
  mutation GetStripeDashboardUrl {
    getStripeDashboardUrl {
      url
      accountId
    }
  }
`;

export const CHECK_STRIPE_ACCOUNT_STATUS_MUTATION = gql`
  mutation CheckStripeAccountStatus {
    checkStripeAccountStatus {
      payoutsEnabled
      onboarded
      detailsSubmitted
      chargesEnabled
      accountId
    }
  }
`;

