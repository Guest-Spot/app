import { ref, computed, watch } from 'vue';
import type { IUser } from 'src/interfaces/user';

const STORAGE_KEY_SHOPS = 'guestspot_favorite_shops';
const STORAGE_KEY_ARTISTS = 'guestspot_favorite_artists';

// Reactive state
const favoriteShops = ref<IUser[]>([]);
const favoriteArtists = ref<IUser[]>([]);

// Load favorites from localStorage on initialization
const loadFavorites = () => {
  try {
    const shopsData = localStorage.getItem(STORAGE_KEY_SHOPS);
    const artistsData = localStorage.getItem(STORAGE_KEY_ARTISTS);

    if (shopsData) {
      favoriteShops.value = JSON.parse(shopsData);
    }

    if (artistsData) {
      favoriteArtists.value = JSON.parse(artistsData);
    }
  } catch (error) {
    console.error('Error loading favorites from localStorage:', error);
  }
};

// Save favorites to localStorage
const saveFavorites = () => {
  try {
    localStorage.setItem(STORAGE_KEY_SHOPS, JSON.stringify(favoriteShops.value));
    localStorage.setItem(STORAGE_KEY_ARTISTS, JSON.stringify(favoriteArtists.value));
  } catch (error) {
    console.error('Error saving favorites to localStorage:', error);
  }
};

// Watch for changes and save to localStorage
watch(favoriteShops, saveFavorites, { deep: true });
watch(favoriteArtists, saveFavorites, { deep: true });

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

// Initialize on module load
loadFavorites();

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
