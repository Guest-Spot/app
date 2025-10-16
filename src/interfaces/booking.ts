import type { IUser } from 'src/interfaces/user';
import type { EReactions } from 'src/interfaces/enums';
import type { IPicture } from './common';

export interface IBooking {
  documentId: string;
  name: string;
  email: string;
  phone: string;
  title?: string | null;
  description: string;
  placement?: string | null;
  size?: string | null;
  day?: string | null;
  start?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  date?: string | null;
  location?: string | null;
  reaction: EReactions;
  rejectNote?: string | null;
  status?: string | null;
  type?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  artistDocumentId?: string | null;
  shopDocumentId?: string | null;
  references: IPicture[];
  artist?:
    | (Pick<IUser, 'documentId' | 'name' | 'city' | 'experience'> & {
        avatar?: IPicture | null;
        parent?: Pick<IUser, 'documentId' | 'name'> | null;
      })
    | null;
  owner?:
    | (Pick<IUser, 'documentId' | 'name'> & {
        avatar?: IPicture | null;
      })
    | null;
  shop?:
    | (Pick<IUser, 'documentId' | 'name'> & {
        pictures?: IPicture[] | null;
      })
    | null;
}

export interface IBookingFilters {
  reaction?: EReactions;
  date?: string;
}

export interface IBookingRequestPayload {
  name: string;
  email: string;
  phone: string;
  location?: string;
  description: string;
  placement: string;
  size: string;
  day: string;
  start: string;
  references: number[];
  artist: string;
  owner: string;
}

export interface IBookingCreateResponse {
  documentId: string;
  name: string;
  email: string;
  phone: string;
  location?: string | null;
  description: string;
  placement?: string | null;
  size?: string | null;
  day: string;
  start: string;
  references?: IPicture[];
  artist?: Pick<IUser, 'documentId' | 'name'> | null;
}

export interface IBookingsQueryResponse {
  bookings: IBooking[];
}
