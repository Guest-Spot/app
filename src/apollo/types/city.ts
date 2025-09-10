import { gql } from "@apollo/client/core";

export const CITIES_QUERY = gql`
  query Cities {
    cities
  }
`;
