<template>
  <!-- Artists Grid -->
  <div class="artists-grid flex column q-gap-md" v-if="artists.length">
    <ArtistCard
      v-for="artist in artists"
      :key="artist.documentId"
      :artist="artist"
      @click="$emit('select-artist', artist)"
      @favorite="$emit('select-favorite', artist.documentId)"
    />
  </div>

  <!-- Empty State -->
  <div v-else class="empty-state bg-block border-radius-lg">
    <q-icon name="people" size="60px" color="grey-6" />
    <h3 class="empty-title">No Artists Yet</h3>
    <p class="empty-description text-grey-6">Invite your first artist to showcase their work</p>
    <q-btn
      class="bg-block"
      icon="person_add"
      label="Invite First Artist"
      @click="$emit('open-invite-dialog')"
      rounded
      unelevated
    />
  </div>
</template>

<script setup lang="ts">
import { ArtistCard } from 'src/components/SearchPage/index';
import type { IArtist } from 'src/interfaces/artist';

interface Props {
  artists: IArtist[];
}

interface Emits {
  (e: 'select-artist', artist: IArtist): void;
  (e: 'select-favorite', artistDocumentId: string): void;
  (e: 'open-invite-dialog'): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<style scoped lang="scss">
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-title {
  margin: 16px 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.empty-description {
  margin: 0 0 24px 0;
}
</style>
