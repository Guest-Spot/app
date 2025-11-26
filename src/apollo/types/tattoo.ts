import { gql } from '@apollo/client/core';

export const TATTOO_STYLES_QUERY = gql`
  query Styles {
    styles {
      documentId
      name
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

