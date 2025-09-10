export interface IFilters {
  name?: string | null;
  city?: string | null;
}

export interface IGraphQLFilters {
  name?: {
    contains: string | null;
  };
  location?: {
    city?: {
      containsi: string | null;
    };
  };
}
