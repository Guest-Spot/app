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

  const fetchNotifies = (filters: unknown = {}) => {
    void loadNotifies(
      null,
      {
        filters: {
          ...(filters || {}),
          recipientDocumentId: {
            eq: userStore.getUser?.profile?.documentId,
          },
        },
        sort: ['createdAt:desc'],
      },
      { fetchPolicy: 'network-only' },
    );
  };

  onResultNotifies((result) => {
    notifiesStore.setNotifies(result?.data?.notifies || []);
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
