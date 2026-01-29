import type { IUser } from 'src/interfaces/user';
import type { IOpeningHours } from './common';
import type { EGuestSpotBookingStatus, EGuestSpotPricingType, EGuestSpotEventType } from './enums';

export interface IGuestSpotPricing {
  type: EGuestSpotPricingType;
  amount: number; // in cents
  description?: string | null;
}

export interface IGuestSpotSlot {
  documentId: string;
  enabled: boolean;
  title?: string;
  description: string;
  pricingOptions: IGuestSpotPricing[];
  depositAmount: number; // in cents
  spaces: number;
  openingHours: IOpeningHours[];
  createdAt: string;
  updatedAt: string;
  shop?: IUser; // populated when loading
}

export interface IGuestSpotBooking {
  documentId: string;
  guestSpotSlotDocumentId: string;
  artistDocumentId: string;
  shopDocumentId: string;
  status: EGuestSpotBookingStatus;
  selectedDate: string;
  selectedTime?: string | null;
  comment?: string | null;
  rejectNote?: string | null;
  depositAmount: number; // in cents
  depositAuthorized: boolean;
  depositAuthorizedAt?: string | null;
  depositCaptured: boolean;
  platformCommissionAmount: number; // in cents
  platformCommissionPaid: boolean;
  paymentIntentId?: string | null;
  createdAt: string;
  updatedAt: string;
  artist?: IUser | null; // populated when loading
  shop?: IUser | null; // populated when loading
  slot?: IGuestSpotSlot | null; // populated when loading
}

export interface IGuestSpotSlotForm {
  title?: string;
  description: string;
  pricingOptions: IGuestSpotPricing[];
  depositAmount: number; // in cents
  spaces: number;
  openingHours: IOpeningHours[];
}

export interface IGuestSpotBookingRequest {
  guestSpotSlotDocumentId: string;
  selectedDate: string;
  selectedTime?: string;
  comment?: string;
}

export interface IGuestSpotBookingFilters {
  status?: EGuestSpotBookingStatus;
  shopDocumentId?: string;
  artistDocumentId?: string;
  guestSpotSlotDocumentId?: string;
  date?: string;
}

export interface IGuestSpotSlotsQueryResponse {
  guestSpotSlots: IGuestSpotSlot[];
}

export interface IGuestSpotSlotQueryResponse {
  guestSpotSlot: IGuestSpotSlot;
}

export interface IGuestSpotBookingsQueryResponse {
  guestSpotBookings: IGuestSpotBooking[];
}

export interface IGuestSpotBookingQueryResponse {
  guestSpotBooking: IGuestSpotBooking;
}

export interface IGuestSpotDepositSession {
  booking: Pick<IGuestSpotBooking, 'documentId'>;
  sessionId: string;
  sessionUrl: string;
  paymentIntentId: string;
}

export interface IGuestSpotEvent {
  documentId: string;
  type: EGuestSpotEventType;
  title: string;
  description: string;
  shopDocumentId: string;
  artistDocumentId?: string | null;
  guestSpotSlotDocumentId?: string | null;
  guestSpotBookingDocumentId?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  shop?: IUser | null; // populated when loading
  artist?: IUser | null; // populated when loading
  slot?: IGuestSpotSlot | null; // populated when loading
  booking?: IGuestSpotBooking | null; // populated when loading
}

export interface IGuestSpotEventFilters {
  type?: EGuestSpotEventType;
  shopDocumentId?: string;
  artistDocumentId?: string;
  date?: string;
}

export interface IGuestSpotEventsQueryResponse {
  guestSpotEvents: IGuestSpotEvent[];
}

export interface IGuestSpotEventQueryResponse {
  guestSpotEvent: IGuestSpotEvent;
}

export interface ICreateGuestSpotEventInput {
  type: EGuestSpotEventType;
  title: string;
  description: string;
  shopDocumentId: string;
  artistDocumentId?: string | null;
  guestSpotSlotDocumentId?: string | null;
  guestSpotBookingDocumentId?: string | null;
}
