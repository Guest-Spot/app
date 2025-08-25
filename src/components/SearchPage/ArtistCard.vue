<template>
  <div class="artist-card" @click="navigateToProfile">
    <div class="artist-avatar">
      <q-img
        :src="artist.avatar || 'https://via.placeholder.com/80x80'"
        :ratio="1"
        class="avatar-img"
        spinner-color="dark"
        spinner-size="24px"
      />
    </div>
    <div class="artist-content">
      <div class="artist-name">{{ artist.name }}</div>
      <div class="artist-specialty">{{ artist.specialty }}</div>
      <div class="artist-bio">{{ artist.bio }}</div>
    </div>
    <div class="artist-actions">
      <q-btn
        round
        flat
        dense
        :icon="isFavorite ? 'favorite' : 'favorite_border'"
        :color="isFavorite ? 'red' : 'grey-6'"
        @click.stop="toggleFavorite"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useFavorites } from '../../modules/useFavorites';
import type { IArtist } from '../../interfaces/artist';

interface Props {
  artist: IArtist;
}

interface Emits {
  (e: 'click', artist: IArtist): void;
  (e: 'favorite', artistId: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const router = useRouter();

const { isArtistFavorite, toggleArtistFavorite } = useFavorites();

const isFavorite = computed(() => isArtistFavorite(props.artist.id));

const toggleFavorite = () => {
  toggleArtistFavorite(props.artist);
  emit('favorite', props.artist.id);
};

const navigateToProfile = () => {
  void router.push(`/artist/${props.artist.id}`);
  emit('click', props.artist);
};
</script>

<style scoped lang="scss">
.artist-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 4px 20px var(--shadow-light);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
}

.artist-avatar {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px var(--shadow-light);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-content {
  flex: 1;
  min-width: 0;
}

.artist-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--brand-dark);
  margin-bottom: 4px;
  line-height: 1.2;
}

.artist-specialty {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 8px;
  line-height: 1.2;
}

.artist-bio {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.artist-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}
</style>
