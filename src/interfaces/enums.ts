export enum InfoItemType {
  Text = 'text',
  Link = 'link',
  Phone = 'phone',
  Email = 'email',
}

export enum LinkType {
  Instagram = 'instagram',
  Telegram = 'telegram',
  Whatsapp = 'whatsapp',
  Facebook = 'facebook',
  Tiktok = 'tiktok',
  Youtube = 'youtube',
  Vk = 'vk',
  Other = 'other',
}

export enum OpeningHoursDays {
  mon = 'Monday',
  tue = 'Tuesday',
  wed = 'Wednesday',
  thu = 'Thursday',
  fri = 'Friday',
  sat = 'Saturday',
  sun = 'Sunday',
}

export enum OpeningHoursIndexDays {
  mon = 1,
  tue = 2,
  wed = 3,
  thu = 4,
  fri = 5,
  sat = 6,
  sun = 7,
}

export enum OpeningHoursKeysDays {
  mon = 'mon',
  tue = 'tue',
  wed = 'wed',
  thu = 'thu',
  fri = 'fri',
  sat = 'sat',
  sun = 'sun',
}

export enum UserType {
  Shop = 'shop',
  Artist = 'artist',
  Guest = 'guest',
}

export enum InviteType {
  InviteCreated = 'invite_created',
  InviteAccepted = 'invite_accepted',
  InviteRejected = 'invite_rejected',
}

export enum EReactions {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
}

export enum NotificationType {
  BookingRequest = 'booking_request',
  BookingAccepted = 'booking_accepted',
  BookingRejected = 'booking_rejected',
  GuestSpotBookingCreated = 'guest_spot_booking_created',
  GuestSpotBookingAccepted = 'guest_spot_booking_accepted',
  GuestSpotBookingRejected = 'guest_spot_booking_rejected',
  InviteCreated = 'invite_created',
  InviteAccepted = 'invite_accepted',
  InviteRejected = 'invite_rejected',
}

export enum EBookingPaymentStatus {
  Unpaid = 'unpaid',
  Paid = 'paid',
  Failed = 'failed',
  Canceled = 'canceled',
  Authorized = 'authorized',
}

export enum EGuestSpotBookingStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum EGuestSpotPricingType {
  Hourly = 'hourly',
  Daily = 'daily',
  Flat = 'flat',
}

export enum EGuestSpotEventType {
  SlotOpened = 'slot_opened',
  SlotUpdated = 'slot_updated',
  BookingCreated = 'booking_created',
  BookingAccepted = 'booking_accepted',
  BookingRejected = 'booking_rejected',
  BookingCompleted = 'booking_completed',
}
