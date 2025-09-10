import type { IArtist } from 'src/interfaces/artist';
import type { LinkType } from 'src/interfaces/enums';

export interface IOpeningHours {
  day: string;
  start: string;
  end: string;
}

export interface IShop {
  documentId: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  location: {
    city: string;
    address: string;
    latitude: string;
    longitude: string;
  };
  description: string;
  pictures: {
    url: string;
  }[];
  phone?: string;
  email?: string;
  openingHours?: IOpeningHours[];
  links?: {
    type: LinkType;
    value: string;
  }[];
};

export interface IGraphQLShopsResult {
  shops: IShop[];
}

export interface IGraphQLShopResult {
  shop: IShop;
}

export interface IGraphQLShopArtistsResult {
  shop: {
    artists: IArtist[];
  }
}
