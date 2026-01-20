<template>
  <div
    class="artist-card flex column q-gap-md bg-block border-radius-md q-pa-md"
    @click="navigateToProfile"
  >
    <div class="flex justify-between items-center q-gap-md full-width">
      <q-avatar size="80px" class="bg-block">
        <q-img
          v-if="artist.avatar?.url"
          :src="artist.avatar?.url"
          :ratio="0.85"
          class="avatar-img"
          spinner-size="24px"
        />
        <q-icon name="person" size="42px" color="grey-9" v-else />
      </q-avatar>
      <div class="artist-content q-pr-md">
        <div class="artist-name-row flex items-center q-gap-xs q-mb-sm">
          <div class="artist-name">{{ artist.name || artist.username || artist.email || 'Unknown artist' }}</div>
          <VerifiedBadge :verified="artist.verified ?? false" :icon-only="true" />
        </div>
        <div class="artist-info">
          <div v-if="artist.parent" class="artist-shop text-grey-6 q-mb-xs">
            <q-icon name="store" size="14px" />
            <span class="text-caption">{{ artist.parent.name }}</span>
          </div>
          <div v-if="location" class="artist-location text-grey-6">
            <q-icon name="location_on" size="14px" />
            <span>{{ location || 'n/a' }}</span>
          </div>
          <div v-if="artist.experience" class="artist-experience text-grey-6">
            <q-icon name="work" size="14px" />
            <span>{{ `${artist.experience}+ years` }}</span>
          </div>
        </div>
      </div>
      <div class="artist-actions absolute-top-right q-ma-sm q-z-2 flex column q-gap-xs">
        <q-btn
          round
          flat
          dense
          :icon="isFavorite ? 'bookmark' : 'bookmark_border'"
          :color="isFavorite ? 'red' : 'grey-6'"
          @click.stop="toggleFavorite"
        />
        <slot name="actions" />
      </div>
    </div>
    <div v-if="$slots.footer" class="artist-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useFavorites } from 'src/modules/useFavorites';
import type { IUser } from 'src/interfaces/user';
import { VerifiedBadge } from 'src/components';

interface Props {
  artist: IUser;
}

interface Emits {
  (e: 'click', artist: IUser): void;
  (e: 'favorite', artistDocumentId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const router = useRouter();

const { isArtistFavorite, toggleArtistFavorite } = useFavorites();

const isFavorite = computed(() => isArtistFavorite(props.artist.documentId));

const location = computed(() => {
  return [props.artist.country, props.artist.state, props.artist.city, props.artist.address].filter(Boolean).join(', ');
});

const toggleFavorite = () => {
  toggleArtistFavorite(props.artist);
  emit('favorite', props.artist.documentId);
};

const navigateToProfile = () => {
  void router.push(`/artist/${props.artist.documentId}`);
  emit('click', props.artist);
};
</script>

<style scoped lang="scss">
.artist-card {
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
  line-height: 1.2;
}

.artist-specialty {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.2;
}

.artist-name-row {
  align-items: center;
}

.artist-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.artist-experience,
.artist-location,
.artist-shop {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
}
</style>
