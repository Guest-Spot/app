import type { LinkType, OpeningHoursDays } from 'src/interfaces/enums';

export interface IPicture {
  id: string;
  url: string;
  index?: number;
}

export interface ILocation {
  city: string;
  address: string;
  latitude: string;
  longitude: string;
}

export interface ILink {
  type: LinkType;
  value: string;
}

export interface ITag {
  name: string;
  id?: string;
}

export interface IOpeningHours {
  id?: string;
  day: keyof typeof OpeningHoursDays;
  start: string | null;
  end: string | null;
}
