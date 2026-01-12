import type { IPicture, IOpeningHours, ILink } from 'src/interfaces/common';

export interface IArtistFormData {
  name: string;
  description: string;
  city?: string;
  country?: string;
  state?: string;
  address?: string;
  phone?: string;
  email?: string;
  avatar?: IPicture | null;
  experience?: number | null;
  depositAmount?: number | null;
  openingHours?: IOpeningHours[];
  chargeDeposit?: boolean;
  links?: ILink[];
}
