import type { IArtist } from 'src/interfaces/artist';

export interface ITrip {
  uuid: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  status: string;
  artist: IArtist;
}

export interface ITripForm {
  uuid: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}
