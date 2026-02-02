import { ref } from 'vue';
import { useMutation } from '@vue/apollo-composable';
import {
  CREATE_GUEST_SPOT_DEPOSIT_MUTATION,
  CAPTURE_GUEST_SPOT_DEPOSIT_MUTATION,
  RELEASE_GUEST_SPOT_DEPOSIT_MUTATION,
} from 'src/apollo/types/mutations/guestSpot';
import type { IGuestSpotDepositSession } from 'src/interfaces/guestSpot';
import useStripe from 'src/composables/useStripe';
import useNotify from 'src/modules/useNotify';
import useUser from 'src/modules/useUser';

export default function useGuestSpotPayment() {
  const isProcessing = ref(false);
  const { openStripeUrl } = useStripe();
  const { showError } = useNotify();
  const { user } = useUser();
  const { mutate: createGuestSpotDeposit } = useMutation(CREATE_GUEST_SPOT_DEPOSIT_MUTATION);
  const { mutate: captureGuestSpotDeposit } = useMutation(CAPTURE_GUEST_SPOT_DEPOSIT_MUTATION);
  const { mutate: releaseGuestSpotDeposit } = useMutation(RELEASE_GUEST_SPOT_DEPOSIT_MUTATION);

  const initiateDeposit = async (bookingId: string): Promise<boolean> => {
    if (!bookingId) {
      showError('Booking not found. Please try again.');
      return false;
    }

    try {
      isProcessing.value = true;

      const variables: { bookingId: string; customerEmail?: string } = {
        bookingId,
      };

      if (user.value?.email) {
        variables.customerEmail = user.value.email;
      }

      const result = await createGuestSpotDeposit(variables);

      const depositSession = result?.data?.createGuestSpotDeposit as
        | IGuestSpotDepositSession
        | undefined;

      if (!depositSession?.sessionUrl) {
        showError('Failed to create payment session. Please try again.');
        return false;
      }

      await openStripeUrl(depositSession.sessionUrl);
      return true;
    } catch (error) {
      console.error('Failed to process deposit:', error);
      showError('Failed to process deposit. Please try again.');
      return false;
    } finally {
      isProcessing.value = false;
    }
  };

  const captureDeposit = async (bookingId: string): Promise<boolean> => {
    if (!bookingId) {
      showError('Booking not found. Please try again.');
      return false;
    }

    try {
      isProcessing.value = true;

      await captureGuestSpotDeposit({ bookingId });

      return true;
    } catch (error) {
      console.error('Failed to capture deposit:', error);
      showError('Failed to capture deposit. Please try again.');
      return false;
    } finally {
      isProcessing.value = false;
    }
  };

  const releaseDeposit = async (bookingId: string): Promise<boolean> => {
    if (!bookingId) {
      showError('Booking not found. Please try again.');
      return false;
    }

    try {
      isProcessing.value = true;

      await releaseGuestSpotDeposit({ bookingId });

      return true;
    } catch (error) {
      console.error('Failed to release deposit:', error);
      showError('Failed to release deposit. Please try again.');
      return false;
    } finally {
      isProcessing.value = false;
    }
  };

  return {
    isProcessing,
    initiateDeposit,
    captureDeposit,
    releaseDeposit,
  };
}
