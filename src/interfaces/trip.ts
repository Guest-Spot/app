export interface ITrip {
  uuid: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  status: string;
  artistUuid: string;
}

export interface ITripForm {
  uuid: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}
