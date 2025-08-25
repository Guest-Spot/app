export interface IArtist {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  avatar?: string;
  addedAt?: number; // Optional for backward compatibility
  experience?: number;
}
