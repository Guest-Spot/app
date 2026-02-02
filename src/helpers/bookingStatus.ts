import type { IBooking } from 'src/interfaces/booking';
import type { IGuestSpotBooking } from 'src/interfaces/guestSpot';
import { EBookingPaymentStatus, EReactions, EGuestSpotBookingStatus } from 'src/interfaces/enums';

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
        label: 'Payment required',
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

type GuestSpotViewAs = 'artist' | 'shop';

/**
 * Returns status info for Guest Spot booking (same shape as getBookingStatusInfo).
 * For artist view with Pending + unpaid deposit returns "Payment required" to match guest booking card.
 */
export const getGuestSpotBookingStatusInfo = (
  booking: IGuestSpotBooking | null | undefined,
  viewAs: GuestSpotViewAs
): BookingStatusInfo => {
  if (!booking) {
    return {
      label: 'Status unavailable',
      variant: 'neutral',
      icon: 'help_outline',
    };
  }

  const status = booking.status;
  const needsDepositPayment =
    viewAs === 'artist' &&
    status === EGuestSpotBookingStatus.Pending &&
    !booking.depositAuthorized &&
    !booking.depositCaptured &&
    (booking.depositAmount ?? 0) > 0;

  if (needsDepositPayment) {
    return {
      label: 'Payment required',
      variant: 'warning',
      icon: 'payments',
    };
  }

  switch (status) {
    case EGuestSpotBookingStatus.Pending:
      return {
        label: 'Pending',
        variant: 'warning',
        icon: 'schedule',
      };
    case EGuestSpotBookingStatus.Accepted:
      return {
        label: 'Accepted',
        variant: 'positive',
        icon: 'check_circle',
      };
    case EGuestSpotBookingStatus.Rejected:
      return {
        label: 'Rejected',
        variant: 'negative',
        icon: 'cancel',
      };
    case EGuestSpotBookingStatus.Completed:
      return {
        label: 'Completed',
        variant: 'positive',
        icon: 'done_all',
      };
    case EGuestSpotBookingStatus.Cancelled:
      return {
        label: 'Cancelled',
        variant: 'neutral',
        icon: 'block',
      };
    default:
      return {
        label: 'Unknown',
        variant: 'neutral',
        icon: 'help',
      };
  }
};
