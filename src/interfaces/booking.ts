import type { IArtist } from './artist';
import type { IShop } from './shop';

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
  shop?: Partial<IShop>;
  artist?: Partial<IArtist>;
  type: BookingType;
}

export interface IBookingFilters {
  status?: IBooking['status'];
  type?: IBooking['type'];
  date?: string;
}
