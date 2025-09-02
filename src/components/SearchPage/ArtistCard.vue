<template>
  <div class="artist-card bg-block border-radius-md q-pa-md" @click="navigateToProfile">
    <q-avatar size="80px" class="bg-block">
      <q-img
        :src="artist.avatar || 'https://via.placeholder.com/80x80'"
        :ratio="0.85"
        class="avatar-img"
        spinner-size="24px"
      />
    </q-avatar>
    <div class="artist-content">
      <div class="artist-name">{{ artist.name }}</div>
      <div class="artist-info">
        <div class="artist-location text-grey-6">
          <q-icon name="location_on" size="14px" />
          <span>{{ artist.location }}</span>
        </div>
        <div class="artist-experience text-grey-6">
          <q-icon name="work" size="14px" />
          <span>{{ artist.experience ? `${artist.experience}+ years` : '2+ years' }}</span>
        </div>
      </div>
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
  (e: 'favorite', artistUuid: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const router = useRouter();

const { isArtistFavorite, toggleArtistFavorite } = useFavorites();

const isFavorite = computed(() => isArtistFavorite(props.artist.uuid));

const toggleFavorite = () => {
  toggleArtistFavorite(props.artist);
  emit('favorite', props.artist.uuid);
};

const navigateToProfile = () => {
  void router.push(`/artist/${props.artist.uuid}`);
  emit('click', props.artist);
};
</script>

<style scoped lang="scss">
.artist-card {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
}

.artist-avatar {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  overflow: hidden;
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
  margin-bottom: 4px;
  line-height: 1.2;
}

.artist-specialty {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.2;
}

.artist-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.artist-experience,
.artist-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
}

.artist-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}
</style>
