import { gql } from '@apollo/client/core';

export const SETTING_QUERY = gql`
  query Setting {
    setting {
      platformFeePercent
    }
  }
`;

