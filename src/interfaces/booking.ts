import type { IUser } from 'src/interfaces/user';

type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
type BookingType = 'shop-to-artist' | 'artist-to-shop';

export interface IBooking {
  documentId: string;
  title: string;
  description: string;
  shopDocumentId: string;
  artistDocumentId: string;
  startTime: string;
  endTime: string;
  date: string;
  location?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  shop?: Partial<IUser>;
  artist?: Partial<IUser>;
  type: BookingType;
}

export interface IBookingFilters {
  status?: IBooking['status'];
  type?: IBooking['type'];
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
  references?: { url: string }[];
  artist?: Pick<IUser, 'documentId' | 'name'> | null;
}
