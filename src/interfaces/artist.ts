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
}

export interface IGraphQLArtistsResult {
  artists: IArtist[];
}

export interface IGraphQLArtistResult {
  artist: IArtist;
}
