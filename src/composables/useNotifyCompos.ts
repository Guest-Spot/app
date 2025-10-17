import { computed } from 'vue';
import { useLazyQuery } from '@vue/apollo-composable';
import { NOTIFICATIONS_QUERY } from 'src/apollo/types/notify';
import { useNotifiesStore } from 'src/stores/notifies';
import { useUserStore } from 'src/stores/user';

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

  onResultNotifies((result) => {
    notifiesStore.setNotifies(result?.data?.notifies || []);
    notifiesStore.setHasNewNotifies(result?.data?.notifies?.length > 0);
  });

  return {
    notifies,
    fetchNotifies,
    refetchNotifies,
    onResultNotifies,
    onErrorNotifies,
  };
};

export default useNotifyCompos;
