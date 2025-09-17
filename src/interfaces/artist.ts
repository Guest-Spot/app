import type { IPicture, ILocation, ILink } from 'src/interfaces/common';

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
  avatar?: IPicture;
  links?: ILink[];
  location?: ILocation;
  city?: string;
  address?: string;
}

export interface IGraphQLArtistsResult {
  artists: IArtist[];
  artists_connection: {
    pageInfo: {
      total: number;
    };
  };
}

export interface IGraphQLArtistResult {
  artist: IArtist;
}

export interface IArtistFormData {
  name: string;
  description: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  avatar?: IPicture | null;
  experience?: number | null;
}
