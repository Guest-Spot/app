import { gql } from '@apollo/client/core';

export const INVITES_QUERY = gql`
  query Invites {
    invites {
      type
      reaction
      documentId
      title
      description
      sender
      recipient
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

export const INVITE_QUERY = gql`
  query Invite($documentId: ID!) {
    invite(documentId: $documentId) {
      type
      reaction
      documentId
      title
      description
      sender
      recipient
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

export const CREATE_INVITE_MUTATION = gql`
  mutation CreateInvite($data: InviteInput!) {
    createInvite(data: $data) {
      type
      reaction
      documentId
      title
      description
      sender
      recipient
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

export const UPDATE_INVITE_MUTATION = gql`
  mutation UpdateInvite($documentId: ID!, $data: InviteInput!) {
    updateInvite(documentId: $documentId, data: $data) {
      type
      reaction
      documentId
      title
      description
      sender
      recipient
      createdAt
      updatedAt
      publishedAt
    }
  }
`;
