import { useMutation, useQuery } from '@vue/apollo-composable';
import {
  CREATE_OPENING_HOUR_MUTATION,
  UPDATE_OPENING_HOUR_MUTATION,
  DELETE_OPENING_HOUR_MUTATION,
} from 'src/apollo/types/mutations/openingHours';
import { OPENING_HOURS_QUERY } from 'src/apollo/types/openingHours';
import type { IOpeningHours } from 'src/interfaces/common';

export default function useOpeningHours() {
  const { mutate: createOpeningHour } = useMutation(CREATE_OPENING_HOUR_MUTATION);
  const { mutate: updateOpeningHour } = useMutation(UPDATE_OPENING_HOUR_MUTATION);
  const { mutate: deleteOpeningHour } = useMutation(DELETE_OPENING_HOUR_MUTATION);

  /**
   * Fetch opening hours using separate query
   */
  function fetchOpeningHours() {
    return useQuery<{ openingHours: IOpeningHours[] }>(OPENING_HOURS_QUERY);
  }

  /**
   * Handle opening hours changes by comparing original and current data
   * @param originalHours - Original opening hours data
   * @param currentHours - Current opening hours data
   * @param userId - User ID to associate with opening hours
   */
  async function handleOpeningHoursChanges(
    originalHours: IOpeningHours[],
    currentHours: IOpeningHours[],
    userId: string
  ): Promise<void> {
    // Find hours to create, update, or delete
    const hoursToCreate: IOpeningHours[] = [];
    const hoursToUpdate: IOpeningHours[] = [];
    const hoursToDelete: string[] = [];

    // Check for new or updated hours
    for (const currentHour of currentHours) {
      const originalHour = originalHours.find(h => h.day === currentHour.day);

      if (!originalHour && (currentHour.start || currentHour.end)) {
        // New hour to create
        hoursToCreate.push({
          day: currentHour.day,
          start: currentHour.start,
          end: currentHour.end,
        });
      } else if (originalHour && originalHour.documentId) {
        if (!currentHour.start && !currentHour.end) {
          // Delete existing hour if both start and end are null
          hoursToDelete.push(originalHour.documentId);
        } else if (
          originalHour.start !== currentHour.start ||
          originalHour.end !== currentHour.end
        ) {
          // Update existing hour
          hoursToUpdate.push({
            documentId: originalHour.documentId,
            day: currentHour.day,
            start: currentHour.start,
            end: currentHour.end,
          });
        }
      }
    }

    // Check for deleted hours (days that existed in original but not in current)
    for (const originalHour of originalHours) {
      const currentHour = currentHours.find(h => h.day === originalHour.day);
      if (!currentHour && originalHour.documentId) {
        hoursToDelete.push(originalHour.documentId);
      }
    }

    // Execute mutations
    const promises: Promise<unknown>[] = [];

    // Create new hours with user association
    for (const hour of hoursToCreate) {
      promises.push(
        createOpeningHour({
          data: {
            day: hour.day,
            start: hour.start,
            end: hour.end,
            user: userId, // Associate with user
          },
        })
      );
    }

    // Update existing hours
    for (const hour of hoursToUpdate) {
      promises.push(
        updateOpeningHour({
          documentId: hour.documentId,
          data: {
            day: hour.day,
            start: hour.start,
            end: hour.end,
          },
        })
      );
    }

    // Delete hours
    for (const hourId of hoursToDelete) {
      promises.push(
        deleteOpeningHour({
          documentId: hourId,
        })
      );
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  /**
   * Create a single opening hour
   * @param data - Opening hour data
   * @param userId - User ID to associate with opening hour
   */
  async function createSingleOpeningHour(
    data: Omit<IOpeningHours, 'documentId'>,
    userId: string
  ): Promise<unknown> {
    return createOpeningHour({
      data: {
        ...data,
        user: userId,
      },
    });
  }

  /**
   * Update a single opening hour
   * @param documentId - Document ID of the opening hour
   * @param data - Updated opening hour data
   */
  async function updateSingleOpeningHour(
    documentId: string,
    data: Omit<IOpeningHours, 'documentId'>
  ): Promise<unknown> {
    return updateOpeningHour({
      documentId,
      data,
    });
  }

  /**
   * Delete a single opening hour
   * @param documentId - Document ID of the opening hour to delete
   */
  async function deleteSingleOpeningHour(documentId: string): Promise<unknown> {
    return deleteOpeningHour({
      documentId,
    });
  }

  return {
    fetchOpeningHours,
    handleOpeningHoursChanges,
    createSingleOpeningHour,
    updateSingleOpeningHour,
    deleteSingleOpeningHour,
  };
}
