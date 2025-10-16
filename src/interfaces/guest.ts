import type { IPicture } from 'src/interfaces/common';

export interface IGuest {
  documentId: string;
  name: string;
  email: string;
  avatar: IPicture | null;
  phone?: string;
  city?: string;
  address?: string;
}

export interface IGuestFormData {
  name: string;
  email: string;
  avatar: string | null;
  phone?: string;
  city?: string;
  address?: string;
}
