import { ref } from 'vue';
import { useMutation } from '@vue/apollo-composable';
import useStripe from 'src/composables/useStripe';
import useNotify from 'src/modules/useNotify';
import useUser from 'src/modules/useUser';
import { CREATE_TIP_PAYMENT_MUTATION } from 'src/apollo/types/mutations/tip';
import type { ITipPaymentSession } from 'src/interfaces/tip';

export default function useTipPayment() {
  const isProcessing = ref(false);
  const { openStripeUrl } = useStripe();
  const { showError } = useNotify();
  const { user } = useUser();
  const { mutate: createTipPayment } = useMutation(CREATE_TIP_PAYMENT_MUTATION);

  const initiateTipPayment = async (
    artistDocumentId?: string | null,
    tipPresetId?: string | null,
    customerEmail?: string | null,
  ): Promise<boolean> => {
    if (!artistDocumentId) {
      showError('Artist profile is not available. Please try again.');
      return false;
    }

    if (!tipPresetId?.trim()) {
      showError('Choose a tip amount to continue.');
      return false;
    }

    try {
      isProcessing.value = true;

      const variables: { artistDocumentId: string; tipPresetId: string; customerEmail?: string } = {
        artistDocumentId,
        tipPresetId: tipPresetId.trim(),
      };

      const email = customerEmail ?? user.value?.email;
      if (email) {
        variables.customerEmail = email;
      }

      const result = await createTipPayment(variables);
      const paymentSession = result?.data?.createTipPayment as ITipPaymentSession | undefined;

      if (!paymentSession?.sessionUrl) {
        showError('Failed to create tip session. Please try again.');
        return false;
      }

      await openStripeUrl(paymentSession.sessionUrl);
      return true;
    } catch (error) {
      console.error('Failed to initiate tip payment:', error);
      showError('Failed to process tip. Please try again.');
      return false;
    } finally {
      isProcessing.value = false;
    }
  };

  return {
    isProcessing,
    initiateTipPayment,
  };
}
