import type { IBooking } from 'src/interfaces/booking';
import { EBookingPaymentStatus, EReactions } from 'src/interfaces/enums';

export type BookingStatusVariant = 'positive' | 'warning' | 'negative' | 'info' | 'neutral';

export interface BookingStatusInfo {
  label: string;
  variant: BookingStatusVariant;
  icon?: string;
}

type BookingStatusInput = Pick<IBooking, 'reaction' | 'paymentStatus'> | null | undefined;

const isPaidStatus = (paymentStatus?: EBookingPaymentStatus | null) => {
  return (
    paymentStatus === EBookingPaymentStatus.Paid ||
    paymentStatus === EBookingPaymentStatus.Authorized
  );
};

export const getBookingStatusInfo = (
  booking: BookingStatusInput,
  payoutsEnabled?: boolean
): BookingStatusInfo => {
  const reaction = booking?.reaction;
  const paymentStatus = booking?.paymentStatus ?? null;

  if (!reaction) {
    return {
      label: 'Status unavailable',
      variant: 'neutral',
      icon: 'help_outline',
    };
  }

  // If artist cannot accept payments, show simplified statuses
  if (!payoutsEnabled) {
    if (reaction === EReactions.Rejected) {
      return {
        label: 'Booking rejected',
        variant: 'negative',
        icon: 'highlight_off',
      };
    }

    if (reaction === EReactions.Accepted) {
      return {
        label: 'Booking accepted',
        variant: 'positive',
        icon: 'check_circle',
      };
    }

    if (reaction === EReactions.Pending) {
      return {
        label: 'Booking pending',
        variant: 'warning',
        icon: 'hourglass_empty',
      };
    }
  }

  if (reaction === EReactions.Rejected) {
    return {
      label: 'Booking rejected',
      variant: 'negative',
      icon: 'highlight_off',
    };
  }

  if (reaction === EReactions.Pending) {
    if (paymentStatus === EBookingPaymentStatus.Unpaid || paymentStatus === null) {
      return {
        label: 'Deposit payment required',
        variant: 'warning',
        icon: 'payments',
      };
    }

    if (isPaidStatus(paymentStatus)) {
      return {
        label: 'Paid, awaiting artist confirmation',
        variant: 'info',
        icon: 'hourglass_empty',
      };
    }

    if (paymentStatus === EBookingPaymentStatus.Failed) {
      return {
        label: 'Payment failed',
        variant: 'negative',
        icon: 'error',
      };
    }

    if (paymentStatus === EBookingPaymentStatus.Canceled) {
      return {
        label: 'Payment canceled',
        variant: 'neutral',
        icon: 'cancel',
      };
    }
  }

  if (reaction === EReactions.Accepted) {
    if (isPaidStatus(paymentStatus)) {
      return {
        label: 'Booking accepted',
        variant: 'positive',
        icon: 'check_circle',
      };
    }

    if (paymentStatus === EBookingPaymentStatus.Unpaid || paymentStatus === null) {
      return {
        label: 'Booking accepted',
        variant: 'positive',
        icon: 'check_circle',
      };
    }

    if (paymentStatus === EBookingPaymentStatus.Failed) {
      return {
        label: 'Accepted, payment failed',
        variant: 'negative',
        icon: 'error',
      };
    }

    if (paymentStatus === EBookingPaymentStatus.Canceled) {
      return {
        label: 'Accepted, payment canceled',
        variant: 'neutral',
        icon: 'cancel',
      };
    }
  }

  return {
    label: 'Status unavailable',
    variant: 'neutral',
    icon: 'help_outline',
  };
};
