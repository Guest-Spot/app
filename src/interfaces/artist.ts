import type { LinkType } from 'src/interfaces/enums';

export interface IArtist {
  documentId: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  phone?: string;
  email?: string;
  experience?: number;
  status?: string;
  avatar?: {
    url: string;
  };
  links?: {
    type: LinkType;
    value: string;
  }[];
  location?: {
    city: string;
    address: string;
    latitude: string;
    longitude: string;
  };
}

export interface IGraphQLArtistsResult {
  artists: IArtist[];
}

export interface IGraphQLArtistResult {
  artist: IArtist;
}
