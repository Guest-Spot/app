import type { UserType } from 'src/interfaces/enums';

export interface IFilters {
  type: UserType | null;
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
