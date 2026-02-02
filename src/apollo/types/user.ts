import { gql } from '@apollo/client/core';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      documentId
      username
      type
      verified
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
      country
      state
      address
      link
      phone
      email
      experience
      stripeAccountID
      payoutsEnabled
      acceptTips
      depositAmount
      chargeDeposit
      verified
      guestSpotEnabled
      approved
      parent {
        documentId
        name
        city
        address
        pictures {
          id
          documentId
          url
        }
      }
      device_tokens {
        token
      }
      profile {
        documentId
        links {
          type
          value
        }
        website
        lat
        lng
      }
    }
  }
`;

export const USERS_QUERY = gql`
  query UsersPermissionsUsers(
    $filters: UsersPermissionsUserFiltersInput
    $sort: [String]
    $pagination: PaginationArg
    $distanceSort: String
  ) {
    usersPermissionsUsers_connection(filters: $filters, sort: $sort, pagination: $pagination, distanceSort: $distanceSort) {
      pageInfo {
        total
      }
    }
    usersPermissionsUsers(filters: $filters, sort: $sort, pagination: $pagination, distanceSort: $distanceSort) {
      documentId
      name
      username
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
      country
      state
      address
      link
      phone
      email
      experience
      stripeAccountID
      payoutsEnabled
      acceptTips
      depositAmount
      chargeDeposit
      verified
      confirmed
      openingHours {
        day
        start
        end
      }
      parent {
        documentId
        name
        city
        address
        openingHours {
          day
          start
          end
        }
        pictures {
          id
          documentId
          url
        }
      }
      profile {
        documentId
        links {
          type
          value
        }
        website
        lat
        lng
      }
    }
  }
`;

export const USER_QUERY = gql`
  query UsersPermissionsUser($documentId: ID!) {
    usersPermissionsUser(documentId: $documentId) {
      documentId
      name
      username
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
      country
      state
      address
      link
      phone
      email
      experience
      stripeAccountID
      payoutsEnabled
      acceptTips
      depositAmount
      chargeDeposit
      verified
      confirmed
      openingHours {
        day
        start
        end
      }
      parent {
        documentId
        name
        city
        address
        openingHours {
          day
          start
          end
        }
        verified
        pictures {
          id
          documentId
          url
        }
      }
      profile {
        documentId
        links {
          type
          value
        }
        website
        lat
        lng
      }
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUsersPermissionsUser($id: ID!, $data: UsersPermissionsUserInput!) {
    updateUsersPermissionsUser(id: $id, data: $data) {
      data {
        documentId
        name
        username
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
        country
        state
        address
        link
        phone
        email
        experience
        stripeAccountID
        payoutsEnabled
        acceptTips
        depositAmount
        chargeDeposit
        verified
        openingHours {
          day
          start
          end
        }
        profile {
          documentId
          links {
            type
            value
          }
          website
          lat
          lng
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

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword(
    $currentPassword: String!
    $password: String!
    $passwordConfirmation: String!
  ) {
    changePassword(
      currentPassword: $currentPassword
      password: $password
      passwordConfirmation: $passwordConfirmation
    ) {
      jwt
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: UsersPermissionsRegisterInput!) {
    register(input: $input) {
      jwt
      user {
        id
        email
      }
    }
  }
`;

export const EMAIL_CONFIRMATION_MUTATION = gql`
  mutation EmailConfirmation($confirmation: String!) {
    emailConfirmation(confirmation: $confirmation) {
      jwt
      user {
        documentId
      }
    }
  }
`;

export const USER_EMAIL_EXISTS_QUERY = gql`
  query Query($email: String!) {
    userEmailExists(email: $email)
  }
`;

export const USER_USERNAME_EXISTS_QUERY = gql`
  query Query($username: String!) {
    userUsernameExists(username: $username)
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

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUsersPermissionsUser($deleteUsersPermissionsUserId: ID!) {
    deleteUsersPermissionsUser(id: $deleteUsersPermissionsUserId) {
      data {
        documentId
      }
    }
  }
`;

export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      ok
    }
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($password: String!, $passwordConfirmation: String!, $code: String!) {
    resetPassword(password: $password, passwordConfirmation: $passwordConfirmation, code: $code) {
      jwt
      user {
        documentId
      }
    }
  }
`;

export const SEND_CLAIM_PROFILE_EMAIL_MUTATION = gql`
  mutation SendClaimProfileEmail($email: String!) {
    sendClaimProfileEmail(email: $email)
  }
`;

export const CREATE_MEMBERSHIP_REQUEST_MUTATION = gql`
  mutation CreateMembershipRequest($data: MembershipRequestInput!) {
    createMembershipRequest(data: $data) {
      documentId
      email
      username
    }
  }
`;

export const MEMBERSHIP_REQUESTS_QUERY = gql`
  query MembershipRequests {
    membershipRequests {
      email
      username
    }
  }
`;
