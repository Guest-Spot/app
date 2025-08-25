export interface IArtist {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  avatar?: string;
  addedAt?: number;
  experience?: number;
  status?: 'available' | 'busy';
}
