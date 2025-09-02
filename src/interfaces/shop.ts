export interface IShop {
  uuid: string;
  username: string;
  title: string;
  location: string;
  description: string;
  pictures: string[];
  phone?: string;
  email?: string;
  dateOpened?: string;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  pricing?: string;
  instagram?: string;
  facebook?: string;
};
