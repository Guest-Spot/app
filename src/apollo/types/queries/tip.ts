import { gql } from '@apollo/client/core';

export const TIP_PRESETS_QUERY = gql`
  query TipPresets {
    tipPresets {
      id
      label
      amountCents
      order
    }
  }
`;
