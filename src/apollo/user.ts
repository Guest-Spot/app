import { gql } from '@apollo/client/core'

export const LOGIN = gql`
  mutation Login($identifier: String!, $password: String!) {
    login(identifier: $identifier, password: $password) {
      identifier
      password
    }
  }
`

export const ME = gql`
  query Me {
    me {
      id
      type
    }
  }
`
