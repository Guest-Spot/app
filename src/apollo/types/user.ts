import { gql } from '@apollo/client/core';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      type
      profile {
        documentId
        name
        pictures {
          id
          documentId
          url
        }
        avatar {
          id
          documentId
          url
        }
        description
        city
        address
        link
        phone
        email
        openingHours {
          day
          start
          end
        }
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation LoginWithRefresh($input: LoginInput!) {
    loginWithRefresh(input: $input) {
      jwt
      refreshToken
      user {
        id
        email
      }
    }
  }
`;

// IMPORTANT: DO NOT use gql for this mutation, it will used in the error link
export const LOGOUT_MUTATION = `
  mutation LogoutWithRefresh($input: RefreshTokenInput!) {
    logoutWithRefresh(input: $input)
  }
`;

export const REFRESH_TOKEN_MUTATION = `
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      jwt
      refreshToken
    }
  }
`;
