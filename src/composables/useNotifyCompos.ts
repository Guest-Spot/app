import { computed } from 'vue';
import { useLazyQuery } from '@vue/apollo-composable';
import { NOTIFICATIONS_QUERY } from 'src/apollo/types/notify';
import { useNotifiesStore } from 'src/stores/notifies';
import { useUserStore } from 'src/stores/user';
import type { INotify } from 'src/interfaces/notify';
import { PAGINATION_PAGE_SIZE } from 'src/config/constants';

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

interface FetchNotifiesOptions {
  filters?: Record<string, unknown>;
  pagination?: {
    page: number;
    pageSize: number;
  };
  append?: boolean;
}

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

  let shouldAppend = false;

  const fetchNotifies = (options: FetchNotifiesOptions = {}): boolean => {
    const recipientDocumentId = userStore.getUser?.documentId;

    if (!recipientDocumentId) {
      shouldAppend = false;
      return false;
    }

    const {
      filters = {},
      pagination = { page: 1, pageSize: PAGINATION_PAGE_SIZE },
      append = false,
    } = options;

    shouldAppend = append;

    void loadNotifies(
      null,
      {
        filters: {
          ...filters,
          recipientDocumentId: {
            eq: recipientDocumentId,
          },
        },
        sort: ['createdAt:desc'],
        pagination,
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
    const existingNotifies = notifiesStore.getNotifies;

    const nextNotifies = shouldAppend
      ? [
          ...existingNotifies,
          ...notifications.filter(
            (notify: INotify) =>
              !existingNotifies.some((existing) => existing.documentId === notify.documentId),
          ),
        ]
      : notifications;

    notifiesStore.setNotifies(nextNotifies);
    notifiesStore.setHasNewNotifies(countNewNotifications(nextNotifies));

    shouldAppend = false;
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
