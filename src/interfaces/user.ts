import type { ILocation, IOpeningHours, ILink } from 'src/interfaces/common';
import type { IArtist } from 'src/interfaces/artist';
import type { IShop } from 'src/interfaces/shop';
import type { UserType } from 'src/interfaces/enums';

export interface IProfile {
  name: string;
  pictures: { url: string }[];
  description: string;
  location: ILocation;
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

// Enhanced User interface for GraphQL
export interface IUser {
  id: string;
  documentId: string;
  email: string;
  username?: string;
  confirmed: boolean;
  blocked: boolean;
  type: UserType;
  profile: IShop | IArtist | null;
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
