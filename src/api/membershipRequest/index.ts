import { api } from 'src/boot/axios';
import type {
  CreateMembershipRequestPayload,
} from 'src/interfaces/membershipRequest';

/**
 * Create a membership request.
 */
export async function createMembershipRequest(payload: CreateMembershipRequestPayload): Promise<void> {
  await api.post(`/api/membership-requests?status=draft`, { data: payload });
}
