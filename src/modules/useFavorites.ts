import { ref, computed, watch, readonly } from 'vue';

export interface FavoriteShop {
  id: number;
  name: string;
  location: string;
  description: string;
  image?: string;
  addedAt: number;
}

export interface FavoriteArtist {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  avatar?: string;
  addedAt: number;
}

const STORAGE_KEY_SHOPS = 'guestspot_favorite_shops';
const STORAGE_KEY_ARTISTS = 'guestspot_favorite_artists';

// Reactive state
const favoriteShops = ref<FavoriteShop[]>([]);
const favoriteArtists = ref<FavoriteArtist[]>([]);

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
const addShopToFavorites = (shop: Omit<FavoriteShop, 'addedAt'>) => {
  const favoriteShop: FavoriteShop = {
    ...shop,
    addedAt: Date.now()
  };
  
  if (!favoriteShops.value.find(s => s.id === shop.id)) {
    favoriteShops.value.push(favoriteShop);
  }
};

const removeShopFromFavorites = (shopId: number) => {
  const index = favoriteShops.value.findIndex(s => s.id === shopId);
  if (index !== -1) {
    favoriteShops.value.splice(index, 1);
  }
};

const addArtistToFavorites = (artist: Omit<FavoriteArtist, 'addedAt'>) => {
  const favoriteArtist: FavoriteArtist = {
    ...artist,
    addedAt: Date.now()
  };
  
  if (!favoriteArtists.value.find(a => a.id === artist.id)) {
    favoriteArtists.value.push(favoriteArtist);
  }
};

const removeArtistFromFavorites = (artistId: number) => {
  const index = favoriteArtists.value.findIndex(a => a.id === artistId);
  if (index !== -1) {
    favoriteArtists.value.splice(index, 1);
  }
};

const isShopFavorite = (shopId: number) => {
  return favoriteShops.value.some(s => s.id === shopId);
};

const isArtistFavorite = (artistId: number) => {
  return favoriteArtists.value.some(a => a.id === artistId);
};

const toggleShopFavorite = (shop: Omit<FavoriteShop, 'addedAt'>) => {
  if (isShopFavorite(shop.id)) {
    removeShopFromFavorites(shop.id);
  } else {
    addShopToFavorites(shop);
  }
};

const toggleArtistFavorite = (artist: Omit<FavoriteArtist, 'addedAt'>) => {
  if (isArtistFavorite(artist.id)) {
    removeArtistFromFavorites(artist.id);
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
    favoriteShops: readonly(favoriteShops),
    favoriteArtists: readonly(favoriteArtists),
    
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
    clearAllFavorites
  };
}
