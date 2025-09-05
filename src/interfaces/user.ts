export enum UserType {
  Shop = 'shop',
  Artist = 'artist',
  Guest = 'guest',
}

export interface IProfile {
  id: string;
  created_at: string;
  type: UserType;
}
