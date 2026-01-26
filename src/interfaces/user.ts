import type { IOpeningHours, ILink, IPicture } from 'src/interfaces/common';
import type { UserType } from 'src/interfaces/enums';
import type { RegisterPushTokenPayload } from 'src/interfaces/pushNotifications';

export interface IProfile {
  documentId?: string;
  links: ILink[];
  website?: string;
  lat?: number;
  lng?: number;
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

// Enhanced User interface for GraphQL
export interface IUser {
  id: string;
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
  country?: string;
  state?: string;
  address?: string;
  link?: string;
  description: string;
  pictures?: IPicture[];
  avatar?: IPicture;
  phone?: string;
  openingHours?: IOpeningHours[];
  experience?: number;
  parent?: IUser | null;
  device_tokens: RegisterPushTokenPayload[];
  stripeAccountID?: string;
  payoutsEnabled?: boolean;
  acceptTips?: boolean;
  depositAmount?: number | null;
  chargeDeposit?: boolean;
  verified?: boolean;
  profile?: IProfile;
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
