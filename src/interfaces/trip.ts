export interface ITrip {
  documentId: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  status: string;
  artistDocumentId: string;
}

export interface ITripForm {
  documentId: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}
