import type { UserType } from 'src/interfaces/enums';
export interface CreateMembershipRequestPayload {
  userId: string;
  username: string;
  email: string;
  type: UserType;
  name: string;
  phone: string;
  link: string;
}
