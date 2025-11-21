export interface ITattooStyle {
  documentId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface ITattooData {
  styles: ITattooStyle[];
}
