export interface IFilters {
  name?: string | null;
  city?: string | null;
}

export interface IGraphQLFilters {
  name?: {
    containsi: string | null;
  };
  location?: {
    city?: {
      containsi: string | null;
    };
  };
}
