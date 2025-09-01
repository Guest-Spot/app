export interface ITrip {
  id: number;
  uuid: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}

export interface ITripForm {
  id: number;
  date: string;
  location: string;
  startTime: string;
  endTime: string;
  description: string;
}
