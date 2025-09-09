import { gql } from '@apollo/client/core';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
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

export const LOGOUT_MUTATION = gql`
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
