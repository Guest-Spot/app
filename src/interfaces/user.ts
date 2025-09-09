export enum UserType {
  Shop = 'shop',
  Artist = 'artist',
  Guest = 'guest',
}

export interface IProfile {
  id: string;
  created_at: string;
  type: UserType;
  fullname: string;
}

// JWT Token interfaces
export interface IJWTTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAccessTokenPayload {
  id: string;
  email: string;
  type: UserType;
  iat: number;
  exp: number;
}

// GraphQL Auth responses
export interface ILoginResponse {
  login: {
    jwt: string;
    refreshToken: string;
    user: IUser;
  };
}

export interface IMeResponse {
  me: IUser;
}

export interface IRefreshTokenResponse {
  refreshToken: {
    jwt: string;
    refreshToken: string;
  };
}

// Enhanced User interface for GraphQL
export interface IUser {
  id: string;
  email: string;
  username?: string;
  confirmed: boolean;
  blocked: boolean;
  profile?: IProfile;
}

// Auth state interface
export interface IAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: IUser | null;
  profile: IProfile | null;
  tokens: IJWTTokens | null;
  isShop: boolean;
  isArtist: boolean;
  isGuest: boolean;
}
