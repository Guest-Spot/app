import type { IPicture } from 'src/interfaces/common';

export interface IArtistFormData {
  name: string;
  description: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  avatar?: IPicture | null;
  experience?: number | null;
}
