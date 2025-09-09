export enum UserType {
  Shop = 'shop',
  Artist = 'artist',
  Guest = 'guest',
}

export interface IProfile {
  id: string;
  created_at: string;
  name: string;
}

// JWT Token interfaces
export interface IJWTTokens {
  accessToken: string;
  refreshToken: string;
}

// GraphQL Auth responses
export interface ILoginResponse<Profile> {
  loginWithRefresh: {
    jwt: string;
    refreshToken: string;
    user: IUser<Profile>;
  };
}

export interface IMeResponse<Profile> {
  me: IUser<Profile>;
}

// Enhanced User interface for GraphQL
export interface IUser<T> {
  id: string;
  uuid: string;
  email: string;
  username?: string;
  confirmed: boolean;
  blocked: boolean;
  type: UserType;
  profile: T;
}

// Auth state interface
export interface IAuthState<Profile> {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: IUser<Profile> | null;
  profile: Profile | null;
  tokens: IJWTTokens | null;
  isShop: boolean;
  isArtist: boolean;
  isGuest: boolean;
}
