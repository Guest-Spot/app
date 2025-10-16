import type { IUser } from 'src/interfaces/user';
import type { EReactions } from 'src/interfaces/enums';
import type { IPicture } from './common';

export interface IBooking {
  documentId: string;
  title: string;
  description: string;
  start: string;
  day: string;
  placement: string;
  size: string;
  location?: string;
  reaction: EReactions;
  artist: Pick<IUser, 'documentId' | 'name'>;
  owner: Pick<IUser, 'documentId' | 'name'>;
  references: IPicture[];
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
  references: string[];
  artist: string;
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
