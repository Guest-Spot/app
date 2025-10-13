import type { IPicture, ILink, IOpeningHours } from 'src/interfaces/common';

export interface IShopFormData {
  pictures: IPicture[];
  name: string;
  description: string;
  city: string;
  address: string;
  phone: '';
  email: '';
  openingHours: IOpeningHours[];
  links: ILink[];
}
