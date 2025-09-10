import { gql } from "@apollo/client/core";

export const ARTISTS_QUERY = gql`
  query Artists($filters: Filters, $params: Params) {
    artists(filters: $filters, params: $params) {
      documentId
      name
      description
      experience
      avatar {
        url
      }
      links {
        type
        value
      }
      location {
        city
        address
        latitude
        longitude
      }
      phone
      createdAt
      updatedAt
    }
  }
`;

export const ARTIST_QUERY = gql`
  query Artist($documentId: ID!) {
  artist(documentId: $documentId) {
    documentId
    name
    description
    experience
    avatar {
      url
    }
    links {
      type
      value
    }
    location {
      city
      address
      latitude
      longitude
    }
    phone
    createdAt
    updatedAt
    publishedAt
  }
}
`;
