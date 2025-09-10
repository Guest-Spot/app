import { gql } from "@apollo/client/core";

export const ARTISTS_QUERY = gql`
  query Artists($filters: ArtistFiltersInput, $sort: [String]) {
    artists(filters: $filters, sort: $sort) {
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
      email
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
      email
      createdAt
      updatedAt
      publishedAt
    }
  }
`;
