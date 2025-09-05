import { useUserStore } from 'src/stores/user';
import { computed } from 'vue';

const useUser = () => {
  const userStore = useUserStore();

  const user = computed(() => userStore.getUser);

  return {
    user,
  };
};

export default useUser;
