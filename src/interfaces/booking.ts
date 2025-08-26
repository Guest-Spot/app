export interface IBooking {
  id: number;
  title: string;
  description: string;
  shopId: number;
  artistId: number;
  startTime: string;
  endTime: string;
  date: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
  // Additional fields for better UX
  shopName?: string;
  artistName?: string;
  shopAvatar?: string;
  artistAvatar?: string;
  type: 'shop-to-artist' | 'artist-to-shop';
}

export interface IBookingFilters {
  status?: IBooking['status'];
  type?: IBooking['type'];
  date?: string;
}
