export interface ITrip {
  documentId: string;
  location: {
    city: string;
    address: string;
    latitude: string;
    longitude: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  description: string;
  ownerDocumentId: string;
}

export interface ITripForm {
  documentId: string;
  location: {
    city: string;
    address: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}

export interface IGraphQLTripsResult {
  trips: ITrip[];
}
