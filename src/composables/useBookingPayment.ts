import { ref } from 'vue';
import { useMutation } from '@vue/apollo-composable';
import { CREATE_BOOKING_PAYMENT_MUTATION } from 'src/apollo/types/mutations/booking';
import type { IBookingPaymentSession } from 'src/interfaces/booking';
import useStripe from 'src/composables/useStripe';
import useNotify from 'src/modules/useNotify';
import useUser from 'src/modules/useUser';

export default function useBookingPayment() {
  const isProcessing = ref(false);
  const { openStripeUrl } = useStripe();
  const { showError } = useNotify();
  const { user } = useUser();
  const { mutate: createBookingPayment } = useMutation(CREATE_BOOKING_PAYMENT_MUTATION);

  const initiatePayment = async (bookingId?: string | null): Promise<boolean> => {
    if (!bookingId) {
      showError('Booking not found. Please try again.');
      return false;
    }

    try {
      isProcessing.value = true;

      // Prepare mutation variables with optional customer email
      const variables: { bookingId: string; customerEmail?: string } = {
        bookingId,
      };

      // Add customer email if available
      if (user.value?.email) {
        variables.customerEmail = user.value.email;
      }

      const result = await createBookingPayment(variables);

      const paymentSession = result?.data?.createBookingPayment as
        | IBookingPaymentSession
        | undefined;

      if (!paymentSession?.sessionUrl) {
        showError('Failed to create payment session. Please try again.');
        return false;
      }

      await openStripeUrl(paymentSession.sessionUrl);
      return true;
    } catch (error) {
      console.error('Failed to process payment:', error);
      showError('Failed to process payment. Please try again.');
      return false;
    } finally {
      isProcessing.value = false;
    }
  };

  return {
    isProcessing,
    initiatePayment,
  };
}
