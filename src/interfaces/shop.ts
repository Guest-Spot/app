export interface IOpeningTimes {
  day: string;
  start: string;
  end: string;
}

export interface IShop {
  documentId: string;
  username: string;
  name: string;
  city: string;
  lat?: number;
  lng?: number;
  address: string;
  description: string;
  pictures: string[];
  phone?: string;
  email?: string;
  dateOpened?: string;
  openingTimes?: IOpeningTimes[];
  pricing?: string;
  website?: string;
  instagram?: string;
};
