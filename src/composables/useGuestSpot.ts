import { computed, nextTick, ref, watch } from 'vue';
import { useLazyQuery, useMutation } from '@vue/apollo-composable';
import {
  GUEST_SPOT_SLOTS_QUERY,
  GUEST_SPOT_SLOT_QUERY,
  GUEST_SPOT_BOOKINGS_QUERY,
  GUEST_SPOT_AVAILABILITY_BOOKINGS_QUERY,
  GUEST_SPOT_BOOKING_QUERY,
} from 'src/apollo/types/queries/guestSpot';
import {
  CREATE_GUEST_SPOT_SLOT_MUTATION,
  UPDATE_GUEST_SPOT_SLOT_MUTATION,
  DELETE_GUEST_SPOT_SLOT_MUTATION,
  TOGGLE_GUEST_SPOT_ENABLED_MUTATION,
  CREATE_GUEST_SPOT_BOOKING_MUTATION,
  APPROVE_GUEST_SPOT_BOOKING_MUTATION,
  REJECT_GUEST_SPOT_BOOKING_MUTATION,
} from 'src/apollo/types/mutations/guestSpot';
import type {
  IGuestSpotSlot,
  IGuestSpotBooking,
  IGuestSpotSlotForm,
  IGuestSpotBookingRequest,
  IGuestSpotBookingFilters,
  IGuestSpotSlotsQueryResponse,
  IGuestSpotSlotQueryResponse,
  IGuestSpotBookingsQueryResponse,
  IGuestSpotBookingQueryResponse,
} from 'src/interfaces/guestSpot';
import { useGuestSpotStore } from 'src/stores/guestSpot';
import useNotify from 'src/modules/useNotify';
import { useUserStore } from 'src/stores/user';

import useGuestSpotEvents from './useGuestSpotEvents';
import { EGuestSpotEventType, EGuestSpotBookingStatus } from 'src/interfaces/enums';

export default function useGuestSpot() {
  const guestSpotStore = useGuestSpotStore();
  const { showSuccess, showError } = useNotify();
  const userStore = useUserStore();
  const { createEvent: createGuestSpotEvent } = useGuestSpotEvents();

  // Queries
  const {
    load: loadGuestSpotSlots,
    refetch: refetchGuestSpotSlots,
    loading: isLoadingSlots,
    onResult: onResultSlots,
    onError: onErrorSlots,
  } = useLazyQuery<IGuestSpotSlotsQueryResponse>(GUEST_SPOT_SLOTS_QUERY);

  const {
    load: loadGuestSpotSlot,
    loading: isLoadingSlot,
    onResult: onResultSlot,
    onError: onErrorSlot,
  } = useLazyQuery<IGuestSpotSlotQueryResponse>(GUEST_SPOT_SLOT_QUERY);

  const {
    load: loadGuestSpotBookings,
    refetch: refetchGuestSpotBookings,
    loading: isLoadingBookings,
    onResult: onResultBookings,
    onError: onErrorBookings,
  } = useLazyQuery<IGuestSpotBookingsQueryResponse>(GUEST_SPOT_BOOKINGS_QUERY);

  const {
    load: loadAvailabilityBookings,
    onResult: onResultAvailabilityBookings,
    onError: onErrorAvailabilityBookings,
  } = useLazyQuery<IGuestSpotBookingsQueryResponse>(GUEST_SPOT_AVAILABILITY_BOOKINGS_QUERY);

  const {
    load: loadMyBookedDatesBookings,
    onResult: onResultMyBookedDatesBookings,
    onError: onErrorMyBookedDatesBookings,
  } = useLazyQuery<IGuestSpotBookingsQueryResponse>(GUEST_SPOT_BOOKINGS_QUERY);

  const {
    load: loadGuestSpotBooking,
    loading: isLoadingBooking,
    onResult: onResultBooking,
    onError: onErrorBooking,
  } = useLazyQuery<IGuestSpotBookingQueryResponse>(GUEST_SPOT_BOOKING_QUERY);

  // Mutations
  const { mutate: createGuestSpotSlot, loading: isCreatingSlot } = useMutation(
    CREATE_GUEST_SPOT_SLOT_MUTATION,
  );

  const { mutate: updateGuestSpotSlot, loading: isUpdatingSlot } = useMutation(
    UPDATE_GUEST_SPOT_SLOT_MUTATION,
  );

  const { mutate: deleteGuestSpotSlot, loading: isDeletingSlot } = useMutation(
    DELETE_GUEST_SPOT_SLOT_MUTATION,
  );

  const { mutate: toggleGuestSpotEnabled, loading: isTogglingEnabled } = useMutation(
    TOGGLE_GUEST_SPOT_ENABLED_MUTATION,
  );

  const { mutate: createGuestSpotBooking, loading: isCreatingBooking } = useMutation(
    CREATE_GUEST_SPOT_BOOKING_MUTATION,
  );

  const { mutate: approveGuestSpotBooking, loading: isApprovingBooking } = useMutation(
    APPROVE_GUEST_SPOT_BOOKING_MUTATION,
  );

  const { mutate: rejectGuestSpotBooking, loading: isRejectingBooking } = useMutation(
    REJECT_GUEST_SPOT_BOOKING_MUTATION,
  );

  // Computed
  const slots = computed(() => guestSpotStore.getSlots);
  const bookings = computed(() => guestSpotStore.getBookings);
  const totalSlots = computed(() => guestSpotStore.getTotalSlots);
  const totalBookings = computed(() => guestSpotStore.getTotalBookings);
  const hasMoreBookings = computed(() => guestSpotStore.getHasMoreBookings);

  // Handlers
  onResultSlots((result) => {
    if (result.data?.guestSpotSlots) {
      guestSpotStore.setSlots(result.data.guestSpotSlots);
    }
  });

  onErrorSlots((error) => {
    console.error('Error loading guest spot slots:', error);
    showError('Failed to load guest spot slots');
  });

  const loadedSlotId = ref<string | null>(null);

  onResultSlot((result) => {
    if (result.data?.guestSpotSlot) {
      guestSpotStore.updateSlot(result.data.guestSpotSlot);
      // If slot doesn't exist in store, add it
      const exists = guestSpotStore.getSlots.some((s) => s.documentId === result.data.guestSpotSlot.documentId);
      if (!exists) {
        guestSpotStore.setSlots([...guestSpotStore.getSlots, result.data.guestSpotSlot]);
      }
      loadedSlotId.value = result.data.guestSpotSlot.documentId;
    }
  });

  onErrorSlot((error) => {
    console.error('Error loading guest spot slot:', error);
    showError('Failed to load guest spot slot');
  });

  const lastBookingsLoadAppend = ref(false);
  const lastBookingsLoadLimit = ref(0);

  onResultBookings((result) => {
    if (result.data?.guestSpotBookings) {
      const mappedBookings = result.data.guestSpotBookings.map((booking) => ({
        ...booking,
        guestSpotSlotDocumentId: booking.slot?.documentId || '',
        artistDocumentId: booking.artist?.documentId || '',
        shopDocumentId: booking.shop?.documentId || '',
      }));
      if (lastBookingsLoadAppend.value) {
        guestSpotStore.addBookings(mappedBookings);
      } else {
        guestSpotStore.setBookings(mappedBookings);
      }
      if (lastBookingsLoadLimit.value > 0) {
        guestSpotStore.setHasMoreBookings(mappedBookings.length === lastBookingsLoadLimit.value);
      }
    }
  });

  onErrorBookings((error) => {
    console.error('Error loading guest spot bookings:', error);
    showError('Failed to load guest spot bookings');
  });

  const availabilityResolveRef = ref<((value: { taken: number }) => void) | null>(null);

  onResultAvailabilityBookings((result) => {
    const resolve = availabilityResolveRef.value;
    availabilityResolveRef.value = null;
    if (!resolve) return;
    const bookingsList = result.data?.guestSpotBookings ?? [];
    const statusesThatTakeSpot = [
      EGuestSpotBookingStatus.Pending,
      EGuestSpotBookingStatus.Accepted,
      EGuestSpotBookingStatus.Completed,
    ];
    const taken = bookingsList.filter((b) => statusesThatTakeSpot.includes(b.status)).length;
    resolve({ taken });
  });

  onErrorAvailabilityBookings(() => {
    const resolve = availabilityResolveRef.value;
    availabilityResolveRef.value = null;
    if (resolve) resolve({ taken: 0 });
  });

  const bookedDatesResolveRef = ref<((value: IGuestSpotBooking[]) => void) | null>(null);

  onResultMyBookedDatesBookings((result) => {
    const resolve = bookedDatesResolveRef.value;
    bookedDatesResolveRef.value = null;
    if (!resolve) return;
    const bookingsList = result.data?.guestSpotBookings ?? [];
    const statusesThatBlockDay = [
      EGuestSpotBookingStatus.Pending,
      EGuestSpotBookingStatus.Accepted,
      EGuestSpotBookingStatus.Completed,
    ];
    const mappedBookings: IGuestSpotBooking[] = bookingsList
      .filter((b) => statusesThatBlockDay.includes(b.status) && b.selectedDate)
      .map((booking) => ({
        ...booking,
        guestSpotSlotDocumentId: booking.slot?.documentId || '',
        artistDocumentId: booking.artist?.documentId || '',
        shopDocumentId: booking.shop?.documentId || '',
      }));
    resolve(mappedBookings);
  });

  onErrorMyBookedDatesBookings(() => {
    const resolve = bookedDatesResolveRef.value;
    bookedDatesResolveRef.value = null;
    if (resolve) resolve([]);
  });

  onResultBooking((result) => {
    if (result.data?.guestSpotBooking) {
      const booking = result.data.guestSpotBooking;
      const mappedBooking = {
        ...booking,
        guestSpotSlotDocumentId: booking.slot?.documentId || '',
        artistDocumentId: booking.artist?.documentId || '',
        shopDocumentId: booking.shop?.documentId || '',
      };
      guestSpotStore.updateBooking(mappedBooking);
    }
  });

  onErrorBooking((error) => {
    console.error('Error loading guest spot booking:', error);
    showError('Failed to load guest spot booking');
  });

  // Methods
  const loadSlots = async (
    filters?: { shopDocumentId?: string; enabled?: boolean },
    sort?: string[],
    pagination?: { limit?: number; start?: number },
  ) => {
    const variables: Record<string, unknown> = {};
    if (filters) {
      const graphQLFilters: Record<string, unknown> = {};
      if (filters.shopDocumentId) {
        graphQLFilters.shop = { documentId: { eq: filters.shopDocumentId } };
      }
      if (filters.enabled !== undefined) {
        graphQLFilters.enabled = { eq: filters.enabled };
      }
      if (Object.keys(graphQLFilters).length > 0) {
        variables.filters = graphQLFilters;
      }
    }
    if (sort) {
      variables.sort = sort;
    }
    if (pagination) {
      variables.pagination = pagination;
    }
    await loadGuestSpotSlots(undefined, variables);
  };

  const loadSlot = async (documentId: string) => {
    await loadGuestSpotSlot(undefined, { documentId });
    // After loading, the slot will be updated in store via onResultSlot
  };

  const currentSlot = computed(() => {
    if (!loadedSlotId.value) return null;
    return guestSpotStore.getSlots.find((s) => s.documentId === loadedSlotId.value) || null;
  });

  const loadBookings = async (
    filters?: IGuestSpotBookingFilters,
    sort?: string[],
    pagination?: { limit?: number; start?: number },
    options?: { append?: boolean },
  ) => {
    lastBookingsLoadAppend.value = options?.append ?? false;
    lastBookingsLoadLimit.value = pagination?.limit ?? 0;

    const variables: Record<string, unknown> = {};
    if (filters) {
      const graphQLFilters: Record<string, unknown> = {};
      if (filters.status) {
        graphQLFilters.status = { eq: filters.status };
      }
      if (filters.shopDocumentId) {
        graphQLFilters.shop = { documentId: { eq: filters.shopDocumentId } };
      }
      if (filters.artistDocumentId) {
        graphQLFilters.artist = { documentId: { eq: filters.artistDocumentId } };
      }
      if (filters.guestSpotSlotDocumentId) {
        graphQLFilters.slot = { documentId: { eq: filters.guestSpotSlotDocumentId } };
      }
      if (filters.date) {
        graphQLFilters.selectedDate = { eq: filters.date };
      }
      if (Object.keys(graphQLFilters).length > 0) {
        variables.filters = graphQLFilters;
      }
    }
    if (sort) {
      variables.sort = sort;
    }
    if (pagination) {
      variables.pagination = pagination;
    }
    await loadGuestSpotBookings(undefined, variables, {
      fetchPolicy: 'network-only',
    });
  };

  const loadBooking = async (documentId: string): Promise<IGuestSpotBooking | null> => {
    return new Promise((resolve) => {
      const unwatch = watch(
        () => guestSpotStore.getBookings.find((b) => b.documentId === documentId),
        (booking) => {
          if (booking) {
            void nextTick(() => unwatch());
            resolve(booking);
          }
        },
        { immediate: true },
      );

      void loadGuestSpotBooking(undefined, { documentId });

      // Timeout fallback
      setTimeout(() => {
        unwatch();
        const booking = guestSpotStore.getBookings.find((b) => b.documentId === documentId);
        resolve(booking || null);
      }, 2000);
    });
  };

  const getAvailabilityForSlotAndDate = (
    slotDocumentId: string,
    date: string,
  ): Promise<{ taken: number }> => {
    return new Promise((resolve) => {
      availabilityResolveRef.value = resolve;
      void loadAvailabilityBookings(undefined, {
        filters: {
          slot: { documentId: { eq: slotDocumentId } },
          selectedDate: { eq: date },
        },
      });
      // Timeout fallback if no result
      setTimeout(() => {
        if (availabilityResolveRef.value === resolve) {
          availabilityResolveRef.value = null;
          resolve({ taken: 0 });
        }
      }, 10000);
    });
  };

  const getBookingsForCurrentUser = (
    slotDocumentId?: string,
    artistDocumentId?: string | null,
  ): Promise<IGuestSpotBooking[]> => {
    const resolvedArtistId = artistDocumentId ?? userStore.getUser?.documentId;
    if (!resolvedArtistId) {
      return Promise.resolve([]);
    }
    return new Promise((resolve) => {
      bookedDatesResolveRef.value = resolve;
      const filters: Record<string, unknown> = {
        artist: { documentId: { eq: resolvedArtistId } },
      };
      if (slotDocumentId) {
        filters.slot = { documentId: { eq: slotDocumentId } };
      }
      void loadMyBookedDatesBookings(undefined, {
        filters,
        pagination: { limit: 200 },
      }, {
        fetchPolicy: 'network-only',
      });
      setTimeout(() => {
        if (bookedDatesResolveRef.value === resolve) {
          bookedDatesResolveRef.value = null;
          resolve([]);
        }
      }, 10000);
    });
  };

  const createSlot = async (data: IGuestSpotSlotForm): Promise<IGuestSpotSlot | null> => {
    try {
      const shopDocumentId = userStore.getUser?.documentId;
      if (!shopDocumentId) {
        showError('Shop not found');
        return null;
      }

      // Prepare data for mutation
      const mutationData = {
        shop: shopDocumentId,
        enabled: true,
        title: data.title || '',
        description: data.description,
        pricingOptions: data.pricingOptions || [],
        depositAmount: data.depositAmount || 0,
        spaces: data.spaces || 1,
        openingHours: (data.openingHours || []).map((hour) => ({
          day: hour.day,
          start: hour.start,
          end: hour.end,
          // Don't include id for new opening hours
        })),
      };

      const result = await createGuestSpotSlot({
        data: mutationData,
      });

      const slot = result?.data?.createGuestSpotSlot as IGuestSpotSlot | undefined;
      if (slot && slot.documentId) {
        guestSpotStore.setSlots([...guestSpotStore.getSlots, slot]);
        showSuccess('Guest spot slot created successfully');

        // Create public event for slot opening
        const shop = userStore.getUser;
        if (shop && shop.documentId) {
          void createGuestSpotEvent({
            type: EGuestSpotEventType.SlotOpened,
            title: `${shop.name} opened a Guest Spot`,
            description: slot.description || 'A new Guest Spot slot is now available',
            shopDocumentId: shop.documentId,
            guestSpotSlotDocumentId: slot.documentId,
          });
        }

        return slot;
      }

      if (slot && !slot.documentId) {
        console.error('Slot created but documentId is missing:', slot);
        showError('Slot created but missing document ID');
      }

      if (!slot) {
        console.error('No slot returned from mutation:', result);
        showError('Failed to create guest spot slot: no data returned');
      }

      return null;
    } catch (error: unknown) {
      console.error('Error creating guest spot slot:', error);
      const errorMessage = (error as Error)?.message || 'Failed to create guest spot slot';
      showError(errorMessage);
      return null;
    }
  };

  const updateSlot = async (
    documentId: string,
    data: IGuestSpotSlotForm,
  ): Promise<IGuestSpotSlot | null> => {
    try {
      const result = await updateGuestSpotSlot({
        documentId,
        data: {
          title: data.title || '',
          description: data.description,
          pricingOptions: data.pricingOptions,
          depositAmount: data.depositAmount,
          spaces: data.spaces,
          openingHours: data.openingHours,
        },
      });

      const slot = result?.data?.updateGuestSpotSlot as IGuestSpotSlot | undefined;
      if (slot) {
        guestSpotStore.updateSlot(slot);
        showSuccess('Guest spot slot updated successfully');

        // Create public event for slot update
        const shop = userStore.getUser;
        if (shop) {
          void createGuestSpotEvent({
            type: EGuestSpotEventType.SlotUpdated,
            title: `${shop.name} updated their Guest Spot`,
            description: slot.description || 'Guest Spot slot has been updated',
            shopDocumentId: shop.documentId,
            guestSpotSlotDocumentId: slot.documentId,
          });
        }

        return slot;
      }
      return null;
    } catch (error) {
      console.error('Error updating guest spot slot:', error);
      showError('Failed to update guest spot slot');
      return null;
    }
  };

  const deleteSlot = async (documentId: string): Promise<boolean> => {
    try {
      await deleteGuestSpotSlot({ documentId });
      guestSpotStore.removeSlot(documentId);
      showSuccess('Guest spot slot deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting guest spot slot:', error);
      showError('Failed to delete guest spot slot');
      return false;
    }
  };

  const toggleEnabled = async (shopDocumentId: string, enabled: boolean): Promise<boolean> => {
    try {
      const result = await toggleGuestSpotEnabled({ shopDocumentId, enabled });

      // Update user's guestSpotEnabled status in store
      const currentUser = userStore.getUser;
      if (currentUser && result?.data?.toggleGuestSpotEnabled) {
        const updatedUser = {
          ...currentUser,
          guestSpotEnabled: result.data.toggleGuestSpotEnabled.guestSpotEnabled,
        };
        userStore.setUser(updatedUser);
      }

      showSuccess(`Guest spot ${enabled ? 'enabled' : 'disabled'} successfully`);
      return true;
    } catch (error) {
      console.error('Error toggling guest spot enabled:', error);
      showError('Failed to toggle guest spot');
      return false;
    }
  };

  const createBooking = async (
    data: IGuestSpotBookingRequest,
  ): Promise<IGuestSpotBooking | null> => {
    try {
      const artistDocumentId = userStore.getUser?.documentId;
      if (!artistDocumentId) {
        showError('Artist not found');
        return null;
      }



      let slot = guestSpotStore.getSlots.find((s) => s.documentId === data.guestSpotSlotDocumentId);
      if (!slot) {
        await loadSlot(data.guestSpotSlotDocumentId);
        slot = guestSpotStore.getSlots.find((s) => s.documentId === data.guestSpotSlotDocumentId);
      }

      if (!slot) {
        showError('Slot not found');
        return null;
      }



      if (!slot.shop?.documentId) {
        showError('Shop information is not available for this slot');
        return null;
      }

      const result = await createGuestSpotBooking({
        data: {
          slot: slot.documentId,
          artist: artistDocumentId,
          selectedDate: data.selectedDate,
          selectedTime: data.selectedTime,
          comment: data.comment,

        },
      });

      const response = result?.data?.createGuestSpotBooking;
      const booking = response?.data as IGuestSpotBooking | undefined;

      if (booking) {
        const mappedBooking = {
          ...booking,
          guestSpotSlotDocumentId: booking.slot?.documentId || data.guestSpotSlotDocumentId,
          artistDocumentId: booking.artist?.documentId || '',
          shopDocumentId: booking.shop?.documentId || '',
        };
        guestSpotStore.setBookings([...guestSpotStore.getBookings, mappedBooking]);

        // Create public event for booking creation
        const artist = userStore.getUser;
        const slotForEvent = slot;
        if (artist && slotForEvent?.shop?.documentId) {
          void createGuestSpotEvent({
            type: EGuestSpotEventType.BookingCreated,
            title: `${artist.name} requested a Guest Spot at ${slotForEvent.shop.name}`,
            description: `Booking request for ${data.selectedDate}${data.selectedTime ? ` at ${data.selectedTime}` : ''}`,
            shopDocumentId: slotForEvent.shop.documentId,
            artistDocumentId: artist.documentId,
            guestSpotSlotDocumentId: slotForEvent.documentId,
            guestSpotBookingDocumentId: mappedBooking.documentId,
          });
        }

        return mappedBooking;
      }
      return null;
    } catch (error) {
      console.error('Error creating guest spot booking:', error);
      showError('Failed to create booking request');
      return null;
    }
  };

  const approveBooking = async (documentId: string): Promise<boolean> => {
    try {
      await approveGuestSpotBooking({ documentId });
      const booking = await loadBooking(documentId);
      showSuccess('Booking approved successfully');

      // Create public event for booking approval
      if (booking) {
        const shop = userStore.getUser;
        if (shop && booking.artist) {
          void createGuestSpotEvent({
            type: EGuestSpotEventType.BookingAccepted,
            title: `${shop.name} accepted ${booking.artist.name}'s Guest Spot request`,
            description: `Booking confirmed for ${booking.selectedDate}${booking.selectedTime ? ` at ${booking.selectedTime}` : ''}`,
            shopDocumentId: shop.documentId,
            artistDocumentId: booking.artist.documentId,
            guestSpotSlotDocumentId: booking.guestSpotSlotDocumentId,
            guestSpotBookingDocumentId: booking.documentId,
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Error approving booking:', error);
      showError('Failed to approve booking');
      return false;
    }
  };

  const rejectBooking = async (documentId: string, rejectNote?: string): Promise<boolean> => {
    try {
      await rejectGuestSpotBooking({ documentId, rejectNote });
      const booking = await loadBooking(documentId);
      showSuccess('Booking rejected successfully');

      // Create public event for booking rejection
      if (booking) {
        const shop = userStore.getUser;
        if (shop && booking.artist) {
          void createGuestSpotEvent({
            type: EGuestSpotEventType.BookingRejected,
            title: `${shop.name} rejected ${booking.artist.name}'s Guest Spot request`,
            description: rejectNote || 'Booking request was rejected',
            shopDocumentId: shop.documentId,
            artistDocumentId: booking.artist.documentId,
            guestSpotSlotDocumentId: booking.guestSpotSlotDocumentId,
            guestSpotBookingDocumentId: booking.documentId,
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Error rejecting booking:', error);
      showError('Failed to reject booking');
      return false;
    }
  };

  return {
    // State
    slots,
    bookings,
    totalSlots,
    totalBookings,
    hasMoreBookings,
    currentSlot,
    isLoadingSlots,
    isLoadingSlot,
    isLoadingBookings,
    isLoadingBooking,
    isCreatingSlot,
    isUpdatingSlot,
    isDeletingSlot,
    isTogglingEnabled,
    isCreatingBooking,
    isApprovingBooking,
    isRejectingBooking,
    // Methods
    loadSlots,
    loadSlot,
    loadBookings,
    loadBooking,
    getAvailabilityForSlotAndDate,
    getBookingsForCurrentUser,
    refetchSlots: refetchGuestSpotSlots,
    refetchBookings: refetchGuestSpotBookings,
    createSlot,
    updateSlot,
    deleteSlot,
    toggleEnabled,
    createBooking,
    approveBooking,
    rejectBooking,
  };
}
