import { useUserStore } from 'src/stores/user';
import { computed } from 'vue';
import { createClient, type User } from '@supabase/supabase-js';
import { API_URL, API_KEY } from 'src/config/constants'

const useUser = () => {
  const userStore = useUserStore();
  const supabase = createClient(API_URL as string, API_KEY as string);

  const user = computed(() => userStore.getUser);
  const isShop = computed(() => userStore.getIsShop);
  const isArtist = computed(() => userStore.getIsArtist);
  const isGuest = computed(() => userStore.getIsGuest);
  const isAuthenticated = computed(() => userStore.getIsAuthenticated);

  const fetchUser = async (): Promise<{ data: User | null, error: Error | null }> => {
    const { data, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      console.error(userErr);
      return { data: null, error: userErr as Error };
    }

    return { data: data.user, error: null }
  };

  const login = async (login: string, password: string) => {
    const { data, error: signInErr } = await supabase.auth.signInWithPassword({
      email: login,
      password: password,
    });

    if (signInErr) {
      console.error('Error logging in:', signInErr);
      return;
    }

    if (!data.user || !data.session) {
      console.error(signInErr);
      return;
    }

    userStore.setUser(data.user);
    userStore.setIsAuthenticated(true);
  };

  const logout = async () => {
    await supabase.auth.signOut({ scope: 'global' });
    userStore.setUser(null);
    userStore.setIsAuthenticated(false);
    userStore.setIsShop(false);
    userStore.setIsArtist(false);
    userStore.setIsGuest(false);
  };

  return {
    user,
    isShop,
    isArtist,
    isGuest,
    isAuthenticated,
    login,
    logout,
    fetchUser,
  };
};

export default useUser;
