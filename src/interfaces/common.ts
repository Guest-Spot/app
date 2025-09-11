import type { LinkType, OpeningHoursDays } from "src/interfaces/enums";

export interface IPicture {
  url: string;
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
}

export interface IOpeningHours {
  day: keyof typeof OpeningHoursDays;
  start: string;
  end: string;
}
