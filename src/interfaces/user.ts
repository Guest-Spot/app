export interface IUser {
  id: string;
  username: string;
  email: string;
  type: 'shop' | 'artist' | 'guest';
  fullname: string;
  avatar?: string;
  isAuthenticated: boolean;
}
