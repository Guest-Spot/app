import { computed } from 'vue';
import { useLazyQuery } from '@vue/apollo-composable';
import { NOTIFICATIONS_QUERY } from 'src/apollo/types/notify';
import { useNotifiesStore } from 'src/stores/notifies';
import { useUserStore } from 'src/stores/user';
import type { INotify } from 'src/interfaces/notify';

const VIEWED_NOTIFICATIONS_KEY = 'viewed_notifications';

// Helper functions for localStorage
const getViewedNotifications = (): string[] => {
  try {
    const stored = localStorage.getItem(VIEWED_NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveViewedNotifications = (documentIds: string[]): void => {
  try {
    localStorage.setItem(VIEWED_NOTIFICATIONS_KEY, JSON.stringify(documentIds));
  } catch (error) {
    console.error('Failed to save viewed notifications:', error);
  }
};

const countNewNotifications = (notifications: INotify[]): number => {
  if (notifications.length === 0) {
    return 0;
  }

  const viewedIds = getViewedNotifications();
  return notifications.filter((notify) => !viewedIds.includes(notify.documentId)).length;
};

const useNotifyCompos = () => {
  const notifiesStore = useNotifiesStore();
  const userStore = useUserStore();

  const {
    load: loadNotifies,
    onResult: onResultNotifies,
    onError: onErrorNotifies,
    refetch: refetchNotifies,
  } = useLazyQuery(NOTIFICATIONS_QUERY);

  const notifies = computed(() => notifiesStore.getNotifies);

  const fetchNotifies = (filters: unknown = {}): boolean => {
    const recipientDocumentId = userStore.getUser?.documentId;

    if (!recipientDocumentId) {
      return false;
    }

    void loadNotifies(
      null,
      {
        filters: {
          ...(filters || {}),
          recipientDocumentId: {
            eq: recipientDocumentId,
          },
        },
        sort: ['createdAt:desc'],
      },
      { fetchPolicy: 'network-only' },
    );

    return true;
  };

  const markNotificationsAsViewed = (notifications: INotify[]): void => {
    const viewedIds = getViewedNotifications();
    const newIds = notifications.map((n) => n.documentId);
    const uniqueIds = Array.from(new Set([...viewedIds, ...newIds]));
    saveViewedNotifications(uniqueIds);

    // Update store after marking as viewed
    notifiesStore.setHasNewNotifies(0);
  };

  onResultNotifies((result) => {
    const notifications = result?.data?.notifies || [];
    notifiesStore.setNotifies(notifications);
    notifiesStore.setHasNewNotifies(countNewNotifications(notifications));
  });

  const isNotificationViewed = (documentId: string): boolean => {
    const viewedIds = getViewedNotifications();
    return viewedIds.includes(documentId);
  };

  return {
    notifies,
    fetchNotifies,
    refetchNotifies,
    onResultNotifies,
    onErrorNotifies,
    markNotificationsAsViewed,
    isNotificationViewed,
  };
};

export default useNotifyCompos;
