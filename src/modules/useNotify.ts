import { useQuasar } from 'quasar';

const useNotify = () => {
  const $q = useQuasar();

  const showSuccess = (message: string) => {
    void $q.notify({
      type: 'positive',
      color: 'dark',
      message,
      position: 'top',
      timeout: 2000,
      actions: [
        {
          icon: 'close',
          color: 'white',
        },
      ],
    });
  };

  const showError = (message: string) => {
    void $q.notify({
      type: 'negative',
      message,
      position: 'top',
      timeout: 2000,
      actions: [
        {
          icon: 'close',
          color: 'white',
        },
      ],
    });
  };

  return {
    showSuccess,
    showError,
  };
};

export default useNotify;
