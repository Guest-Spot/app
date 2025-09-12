import type { ILocation } from 'src/interfaces/common';

export interface ITrip {
  documentId: string;
  location: ILocation;
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  description: string;
  ownerDocumentId: string;
}

export interface ITripForm {
  documentId: string;
  location: ILocation;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}

export interface IGraphQLTripsResult {
  trips: ITrip[];
}
