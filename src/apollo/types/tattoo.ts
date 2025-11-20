import { gql } from '@apollo/client/core';

export const TATTOO_STYLES_QUERY = gql`
  query Tattoo {
    tattoo {
      documentId
      styles {
        ... on ComponentTattooStyles {
          name
        }
      }
    }
  }
`;

