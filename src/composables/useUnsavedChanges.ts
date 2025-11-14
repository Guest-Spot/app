import { onBeforeMount, onBeforeUnmount, type Ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { useQuasar } from 'quasar';

/**
 * Composable for handling unsaved changes warning
 * @param hasChanges - Computed ref that indicates if there are unsaved changes
 * @returns Object with beforeUnloadHandler for testing purposes
 */
export function useUnsavedChanges(hasChanges: Ref<boolean>) {
  const $q = useQuasar();

  // Handle browser beforeunload event (closing tab/window or refreshing)
  const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
    if (hasChanges.value) {
      e.preventDefault();
      // Chrome requires returnValue to be set
      e.returnValue = '';
    }
  };

  // Handle Vue Router navigation
  onBeforeRouteLeave(() => {
    if (hasChanges.value) {
      return new Promise((resolve) => {
        $q.dialog({
          title: 'Unsaved changes',
          message: 'You have unsaved changes. Do you want to leave the page without saving?',
          cancel: {
            label: 'Leave',
            rounded: true,
            color: 'grey-9',
          },
          ok: {
            label: 'Stay',
            rounded: true,
            color: 'primary',
          },
          persistent: true,
        })
          .onOk(() => {
            resolve(true);
          })
          .onCancel(() => {
            resolve(false);
          });
      });
    }
    return true;
  });

  // Setup beforeunload listener on mount
  onBeforeMount(() => {
    window.addEventListener('beforeunload', beforeUnloadHandler);
  });

  // Cleanup beforeunload listener on unmount
  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', beforeUnloadHandler);
  });

  return {
    beforeUnloadHandler,
  };
}

