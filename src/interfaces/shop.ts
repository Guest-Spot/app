import type { IArtist } from 'src/interfaces/artist';
import type { IPicture, ILocation, ILink, IOpeningHours } from 'src/interfaces/common';

export interface IShop {
  documentId: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  location: ILocation;
  description: string;
  pictures: IPicture[];
  phone?: string;
  email?: string;
  openingHours?: IOpeningHours[];
  links?: ILink[];
}

export interface IShopFormData {
  pictures: string[];
  name: string;
  description: string;
  location: ILocation;
  phone: '',
  email: '',
  links: ILink[],
  openingHours: IOpeningHours[],
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
