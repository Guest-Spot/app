import type { IArtist } from 'src/interfaces/artist';

export interface ITrip {
  id: number;
  uuid: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  artist: IArtist;
}

export interface ITripForm {
  id: number;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}
