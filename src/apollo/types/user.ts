import { gql } from '@apollo/client/core';

export const ME_QUERY = gql`
  query Me {
    me {
      documentId
      username
      type
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
      experience
      openingHours {
        day
        start
        end
      }
    }
  }
`;

export const USERS_QUERY = gql`
  query UsersPermissionsUsers($filters: UsersPermissionsUserFiltersInput, $sort: [String], $pagination: PaginationArg) {
    usersPermissionsUsers_connection {
      pageInfo {
        total
      }
    }
    usersPermissionsUsers(filters: $filters, sort: $sort, pagination: $pagination) {
      documentId
      name
      createdAt
      updatedAt
      type
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
      experience
      openingHours {
        day
        start
        end
      }
    }
  }
`;

export const USER_QUERY = gql`
  query UsersPermissionsUser($documentId: ID!) {
    usersPermissionsUser(documentId: $documentId) {
      documentId
      name
      createdAt
      updatedAt
      type
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
      experience
      openingHours {
        day
        start
        end
      }
    }
  }
`;

export const USER_CHILDS_QUERY = gql`
  query UserChilds($documentId: ID!) {
    userChilds(documentId: $documentId) {
      documentId
      name
      createdAt
      updatedAt
      type
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
      experience
      openingHours {
        day
        start
        end
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

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($currentPassword: String!, $password: String!, $passwordConfirmation: String!) {
    changePassword(currentPassword: $currentPassword, password: $password, passwordConfirmation: $passwordConfirmation) {
      jwt
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
