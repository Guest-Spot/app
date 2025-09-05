import { useUserStore } from 'src/stores/user';
import { computed } from 'vue';
import { createClient, type User } from '@supabase/supabase-js';
import { type IProfile, UserType } from 'src/interfaces/user';
import { API_URL, API_KEY } from 'src/config/constants'

const useUser = () => {
  const userStore = useUserStore();
  const supabase = createClient(API_URL as string, API_KEY as string);

  const user = computed(() => userStore.getUser);
  const profile = computed(() => userStore.getProfile);
  const isShop = computed(() => userStore.getIsShop);
  const isArtist = computed(() => userStore.getIsArtist);
  const isGuest = computed(() => userStore.getIsGuest);
  const isAuthenticated = computed(() => userStore.getIsAuthenticated);

  const fetchProfile = async (userId: string): Promise<{ data: IProfile | null, error: Error | null }> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, type, created_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.error(error);
      return { data: null, error: error as Error };
    }

    return { data, error: null };
  };

  const fetchUser = async (): Promise<{ data: User | null, error: Error | null }> => {
    const { data, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      console.error(userErr);
      return { data: null, error: userErr as Error };
    }

    return { data: data.user, error: null }
  };

  const fetchUserAndProfile = async (): Promise<void> => {
    const { data: user, error: userErr } = await fetchUser();
    if (userErr) {
      console.error(userErr);
      return;
    }

    if (!user?.id) {
      console.error('User ID is not found');
      return;
    }

    const { data: profile, error: profileErr } = await fetchProfile(user.id);

    if (profileErr) {
      console.error(profileErr);
      return;
    }

    userStore.setUser(user);
    userStore.setIsAuthenticated(true);
    userStore.setIsShop(profile?.type === UserType.Shop);
    userStore.setIsArtist(profile?.type === UserType.Artist);
    userStore.setIsGuest(profile?.type === UserType.Guest);
    userStore.setProfile(profile);
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

    const { data: profile, error: profileErr } = await fetchProfile(data.user.id);

    if (profileErr) {
      console.error(profileErr);
      return;
    }

    userStore.setUser(data.user);
    userStore.setIsAuthenticated(true);
    userStore.setIsShop(profile?.type === UserType.Shop);
    userStore.setIsArtist(profile?.type === UserType.Artist);
    userStore.setIsGuest(profile?.type === UserType.Guest);
    userStore.setProfile(profile);
  };

  const logout = async () => {
    await supabase.auth.signOut({ scope: 'global' });
    userStore.setUser(null);
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
    fetchUser,
    fetchProfile,
    fetchUserAndProfile,
  };
};

export default useUser;
