import type { UserType } from 'src/interfaces/enums';

export interface IFilters {
  type: UserType | null;
  name?: string | null;
  city?: string | null;
  styles?: string[] | null;
  guestSpotsAvailable?: boolean | null;
}

export interface IGraphQLFilters {
  name?: {
    containsi: string | null;
  };
  city?: {
    containsi: string | null;
  };
  styles?: {
    name: {
      in: string[];
    };
  };
  location?: {
    city?: {
      containsi: string | null;
    };
  };
}
