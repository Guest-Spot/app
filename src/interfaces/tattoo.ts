export interface ITattooStyle {
  name: string;
}

export interface ITattooData {
  tattoo: {
    documentId: string;
    styles: ITattooStyle[];
  };
}

