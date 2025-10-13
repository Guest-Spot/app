import type { IOpeningHours, ILink, IPicture } from 'src/interfaces/common';
import type { UserType } from 'src/interfaces/enums';

export interface IProfile {
  name: string;
  pictures: IPicture[];
  description: string;
  link: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  links: ILink[];
  openingHours: IOpeningHours[];
}

// JWT Token interfaces
export interface IJWTTokens {
  accessToken: string;
  refreshToken: string;
}

// GraphQL Auth responses
export interface ILoginResponse {
  loginWithRefresh: {
    jwt: string;
    refreshToken: string;
    user: IUser;
  };
}

export interface IMeResponse {
  me: IUser;
}

export interface IGraphQLUsersResult {
  usersPermissionsUsers: IUser[];
  usersPermissionsUsers_connection: {
    pageInfo: {
      total: number;
    };
  };
}

export interface IGraphQLUserResult {
  usersPermissionsUser: IUser;
}

export interface IGraphQLUserChildsResult {
  userChilds: IUser[];
}

// Enhanced User interface for GraphQL
export interface IUser {
  documentId: string;
  email: string;
  username?: string;
  confirmed: boolean;
  blocked: boolean;
  type: UserType;
  createdAt: string;
  updatedAt: string;
  name: string;
  city?: string;
  address?: string;
  link?: string;
  description: string;
  pictures?: IPicture[];
  avatar?: IPicture;
  phone?: string;
  openingHours?: IOpeningHours[];
  experience?: number;
}

// Auth state interface
export interface IAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: IUser | null;
  tokens: IJWTTokens | null;
  isShop: boolean;
  isArtist: boolean;
  isGuest: boolean;
}
