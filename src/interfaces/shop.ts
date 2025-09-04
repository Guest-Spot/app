export interface IOpeningTimes {
  day: string;
  start: string;
  end: string;
}

export interface IShop {
  uuid: string;
  username: string;
  title: string;
  city: string;
  lat: number;
  lng: number;
  address: string;
  description: string;
  pictures: string[];
  phone?: string;
  email?: string;
  dateOpened?: string;
  openingTimes?: IOpeningTimes[];
  pricing?: string;
  instagram?: string;
};
