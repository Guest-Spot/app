import { ref, computed, watch } from 'vue';
import type { IUser } from 'src/interfaces/user';
import { useUserStore } from 'src/stores/user';

const STORAGE_KEY_SHOPS = 'guestspot_favorite_shops';
const STORAGE_KEY_ARTISTS = 'guestspot_favorite_artists';

// Reactive state
const favoriteShops = ref<IUser[]>([]);
const favoriteArtists = ref<IUser[]>([]);

const userStore = useUserStore();
const currentUserId = computed(() => userStore.getUser?.documentId || 'guest');

const favoritesShopsByUser = ref<Record<string, IUser[]>>({});
const favoritesArtistsByUser = ref<Record<string, IUser[]>>({});

let hasLoaded = false;
let isSyncingFavorites = false;

const cloneUsersList = (list: IUser[]): IUser[] => list.map((user) => ({ ...user })) as IUser[];

const parseStoredFavorites = (
  data: string | null,
  fallbackUserId: string,
): Record<string, IUser[]> => {
  if (!data) {
    return {};
  }

  try {
    const parsed = JSON.parse(data) as unknown;

    if (Array.isArray(parsed)) {
      return { [fallbackUserId]: parsed as IUser[] };
    }

    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, IUser[]>;
    }
  } catch (error) {
    console.error('Error parsing favorites from localStorage:', error);
  }

  return {};
};

const saveFavorites = () => {
  try {
    localStorage.setItem(STORAGE_KEY_SHOPS, JSON.stringify(favoritesShopsByUser.value));
    localStorage.setItem(STORAGE_KEY_ARTISTS, JSON.stringify(favoritesArtistsByUser.value));
  } catch (error) {
    console.error('Error saving favorites to localStorage:', error);
  }
};

const syncFavoritesForCurrentUser = () => {
  const userId = currentUserId.value;

  const shops = favoritesShopsByUser.value[userId] || [];
  const artists = favoritesArtistsByUser.value[userId] || [];

  isSyncingFavorites = true;
  favoriteShops.value = cloneUsersList(shops);
  favoriteArtists.value = cloneUsersList(artists);

  setTimeout(() => {
    isSyncingFavorites = false;
  }, 0);
};

const ensureFavoritesLoaded = () => {
  if (!hasLoaded) {
    const userId = currentUserId.value;

    favoritesShopsByUser.value = parseStoredFavorites(
      localStorage.getItem(STORAGE_KEY_SHOPS),
      userId,
    );
    favoritesArtistsByUser.value = parseStoredFavorites(
      localStorage.getItem(STORAGE_KEY_ARTISTS),
      userId,
    );

    hasLoaded = true;
  }

  syncFavoritesForCurrentUser();
};

watch(
  currentUserId,
  () => {
    ensureFavoritesLoaded();
  },
  { immediate: true },
);

watch(
  favoriteShops,
  (newShops) => {
    if (!hasLoaded || isSyncingFavorites) {
      return;
    }

    const userId = currentUserId.value;

    favoritesShopsByUser.value = {
      ...favoritesShopsByUser.value,
      [userId]: cloneUsersList(newShops),
    };

    saveFavorites();
  },
  { deep: true },
);

watch(
  favoriteArtists,
  (newArtists) => {
    if (!hasLoaded || isSyncingFavorites) {
      return;
    }

    const userId = currentUserId.value;

    favoritesArtistsByUser.value = {
      ...favoritesArtistsByUser.value,
      [userId]: cloneUsersList(newArtists),
    };

    saveFavorites();
  },
  { deep: true },
);

// Computed properties
const totalFavorites = computed(() => favoriteShops.value.length + favoriteArtists.value.length);

// Methods
const addShopToFavorites = (shop: IUser) => {
  const favoriteShop: IUser = shop;

  if (!favoriteShops.value.find((s) => s.documentId === shop.documentId)) {
    favoriteShops.value.push(favoriteShop);
  }
};

const removeShopFromFavorites = (shopId: string) => {
  const index = favoriteShops.value.findIndex((s) => s.documentId === shopId);
  if (index !== -1) {
    favoriteShops.value.splice(index, 1);
  }
};

const addArtistToFavorites = (artist: IUser) => {
  const favoriteArtist: IUser = artist;

  if (!favoriteArtists.value.find((a) => a.documentId === artist.documentId)) {
    favoriteArtists.value.push(favoriteArtist);
  }
};

const removeArtistFromFavorites = (artistId: string) => {
  const index = favoriteArtists.value.findIndex((a) => a.documentId === artistId);
  if (index !== -1) {
    favoriteArtists.value.splice(index, 1);
  }
};

const isShopFavorite = (shopId: string) => {
  return favoriteShops.value.some((s) => s.documentId === shopId);
};

const isArtistFavorite = (artistId: string) => {
  return favoriteArtists.value.some((a) => a.documentId === artistId);
};

const toggleShopFavorite = (shop: IUser) => {
  if (isShopFavorite(shop.documentId)) {
    removeShopFromFavorites(shop.documentId);
  } else {
    addShopToFavorites(shop);
  }
};

const toggleArtistFavorite = (artist: IUser) => {
  if (isArtistFavorite(artist.documentId)) {
    removeArtistFromFavorites(artist.documentId);
  } else {
    addArtistToFavorites(artist);
  }
};

const clearAllFavorites = () => {
  favoriteShops.value = [];
  favoriteArtists.value = [];
};

export function useFavorites() {
  return {
    // State
    favoriteShops: favoriteShops,
    favoriteArtists: favoriteArtists,

    // Computed
    totalFavorites,

    // Methods
    addShopToFavorites,
    removeShopFromFavorites,
    addArtistToFavorites,
    removeArtistFromFavorites,
    isShopFavorite,
    isArtistFavorite,
    toggleShopFavorite,
    toggleArtistFavorite,
    clearAllFavorites,
  };
}
