import { computed, ref } from 'vue';
import { useLazyQuery, useMutation } from '@vue/apollo-composable';
import {
  GUEST_SPOT_EVENTS_QUERY,
  GUEST_SPOT_EVENT_QUERY,
} from 'src/apollo/types/queries/guestSpotEvents';
import { CREATE_GUEST_SPOT_EVENT_MUTATION } from 'src/apollo/types/mutations/guestSpotEvents';
import type {
  IGuestSpotEvent,
  IGuestSpotEventFilters,
  IGuestSpotEventsQueryResponse,
  IGuestSpotEventQueryResponse,
  ICreateGuestSpotEventInput,
} from 'src/interfaces/guestSpot';
import useNotify from 'src/modules/useNotify';

export default function useGuestSpotEvents() {
  const { showError } = useNotify();

  // Queries
  const {
    load: loadGuestSpotEvents,
    refetch: refetchGuestSpotEvents,
    loading: isLoadingEvents,
    onResult: onResultEvents,
    onError: onErrorEvents,
  } = useLazyQuery<IGuestSpotEventsQueryResponse>(GUEST_SPOT_EVENTS_QUERY);

  const {
    load: loadGuestSpotEvent,
    loading: isLoadingEvent,
    onResult: onResultEvent,
    onError: onErrorEvent,
  } = useLazyQuery<IGuestSpotEventQueryResponse>(GUEST_SPOT_EVENT_QUERY);

  // Mutations
  const { mutate: createGuestSpotEvent, loading: isCreatingEvent } = useMutation(
    CREATE_GUEST_SPOT_EVENT_MUTATION,
  );

  // State
  const events = ref<IGuestSpotEvent[]>([]);
  const totalEvents = ref(0);
  const pageEvents = ref(1);
  const hasMoreEvents = ref(true);

  // Handlers
  onResultEvents((result) => {
    if (result.data?.guestSpotEvents) {
      if (pageEvents.value === 1) {
        events.value = result.data.guestSpotEvents;
      } else {
        events.value = [...events.value, ...result.data.guestSpotEvents];
      }
      hasMoreEvents.value = result.data.guestSpotEvents.length > 0;
    }
  });

  onErrorEvents((error) => {
    console.error('Error loading guest spot events:', error);
    showError('Failed to load guest spot events');
  });

  onResultEvent((result) => {
    if (result.data?.guestSpotEvent) {
      const event = result.data.guestSpotEvent;
      const index = events.value.findIndex((e) => e.documentId === event.documentId);
      if (index >= 0) {
        events.value[index] = event;
      } else {
        events.value = [event, ...events.value];
      }
    }
  });

  onErrorEvent((error) => {
    console.error('Error loading guest spot event:', error);
    showError('Failed to load guest spot event');
  });

  // Methods
  const loadEvents = async (
    filters?: IGuestSpotEventFilters,
    sort?: string[],
    pagination?: { limit?: number; start?: number },
  ) => {
    const variables: Record<string, unknown> = {};
    if (filters) {
      const graphQLFilters: Record<string, unknown> = {};
      if (filters.type) {
        graphQLFilters.type = { eq: filters.type };
      }
      if (filters.shopDocumentId) {
        graphQLFilters.shopDocumentId = { eq: filters.shopDocumentId };
      }
      if (filters.artistDocumentId) {
        graphQLFilters.artistDocumentId = { eq: filters.artistDocumentId };
      }
      if (filters.date) {
        graphQLFilters.createdAt = { eq: filters.date };
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
    } else {
      variables.pagination = { limit: 20, start: (pageEvents.value - 1) * 20 };
    }
    await loadGuestSpotEvents(undefined, variables);
  };

  const loadEvent = async (documentId: string) => {
    await loadGuestSpotEvent(undefined, { documentId });
  };

  const createEvent = async (input: ICreateGuestSpotEventInput): Promise<IGuestSpotEvent | null> => {
    try {
      // Build data object - try different relation formats
      const mutationData: Record<string, unknown> = {
        type: input.type,
        title: input.title,
        description: input.description,
      };

      // Try simple ID format for relations
      if (input.guestSpotSlotDocumentId) {
        mutationData.slot = input.guestSpotSlotDocumentId;
      }
      if (input.guestSpotBookingDocumentId) {
        mutationData.booking = input.guestSpotBookingDocumentId;
      }
      if (input.artistDocumentId) {
        mutationData.artist = input.artistDocumentId;
      }
      if (input.shopDocumentId) {
        mutationData.shop = input.shopDocumentId;
      }

      const result = await createGuestSpotEvent({
        data: mutationData,
      });

      const event = result?.data?.createGuestSpotEvent?.data as IGuestSpotEvent | undefined;
      if (event) {
        events.value = [event, ...events.value];
        return event;
      }
      return null;
    } catch (error) {
      console.error('Error creating guest spot event:', error);
      showError('Failed to create guest spot event');
      return null;
    }
  };

  const resetPagination = () => {
    pageEvents.value = 1;
    hasMoreEvents.value = true;
    events.value = [];
  };

  return {
    events: computed(() => events.value),
    totalEvents: computed(() => totalEvents.value),
    pageEvents: computed(() => pageEvents.value),
    hasMoreEvents: computed(() => hasMoreEvents.value),
    isLoadingEvents: computed(() => isLoadingEvents.value),
    isLoadingEvent: computed(() => isLoadingEvent.value),
    isCreatingEvent: computed(() => isCreatingEvent.value),
    loadEvents,
    loadEvent,
    createEvent,
    refetchEvents: refetchGuestSpotEvents,
    resetPagination,
  };
}
