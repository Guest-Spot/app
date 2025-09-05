import { useUserStore } from 'src/stores/user';
import { computed, inject } from 'vue';
import type { SupabaseClient } from '@supabase/supabase-js';
import { UserType } from 'src/interfaces/user';

const useUser = () => {
  const userStore = useUserStore();
  const supabase = inject('supabase') as SupabaseClient;

  const user = computed(() => userStore.getUser);
  const profile = computed(() => userStore.getProfile);
  const isShop = computed(() => userStore.getIsShop);
  const isArtist = computed(() => userStore.getIsArtist);
  const isGuest = computed(() => userStore.getIsGuest);
  const isAuthenticated = computed(() => userStore.getIsAuthenticated);

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

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, type, created_at')
      .eq('id', data.user.id)
      .single();

    if (profileErr) {
      console.error(profileErr);
      return;
    }

    userStore.setUser(data.user);
    userStore.setSession(data.session);
    userStore.setIsAuthenticated(true);
    userStore.setIsShop(profile.type === UserType.Shop);
    userStore.setIsArtist(profile.type === UserType.Artist);
    userStore.setIsGuest(profile.type === UserType.Guest);
    userStore.setProfile(profile);
  };

  const logout = async () => {
    await supabase.auth.signOut({ scope: 'global' });
    userStore.setUser(null);
    userStore.setSession(null);
    userStore.setIsAuthenticated(false);
    userStore.setProfile(null);
    userStore.setIsShop(false);
    userStore.setIsArtist(false);
    userStore.setIsGuest(false);
  };

  return {
    user,
    profile,
    isShop,
    isArtist,
    isGuest,
    isAuthenticated,
    login,
    logout,
  };
};

export default useUser;
