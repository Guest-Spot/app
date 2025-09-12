import type { IArtist } from 'src/interfaces/artist';
import type { IPicture, ILink, IOpeningHours } from 'src/interfaces/common';

export interface IShop {
  documentId: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  city: string;
  address: string;
  link: string;
  description: string;
  pictures: IPicture[];
  phone?: string;
  email?: string;
  openingHours?: IOpeningHours[];
  links?: ILink[];
}

export interface IShopFormData {
  pictures: IPicture[];
  name: string;
  description: string;
  city: string;
  address: string;
  phone: '';
  email: '';
}

export interface IGraphQLShopsResult {
  shops: IShop[];
}

export interface IGraphQLShopResult {
  shop: IShop;
}

export interface IGraphQLShopArtistsResult {
  shopArtists: IArtist[];
}
