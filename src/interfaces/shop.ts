export interface IShop {
  id: number;
  username: string;
  title: string;
  location: string;
  description: string;
  avatar: string;
  phone?: string;
  email?: string;
  dateOpened?: string;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  pricing?: string;
  instagram?: string;
  facebook?: string;
  addedAt?: number;
};
