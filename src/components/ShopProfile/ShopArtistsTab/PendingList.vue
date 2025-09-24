<template>
  <!-- Artists Grid -->
  <div class="artists-grid flex column q-gap-md" v-if="artists.length">
    <ArtistCard
      v-for="artist in artists"
      :key="artist.documentId"
      :artist="artist"
      @click="$emit('select-artist', artist)"
      @favorite="$emit('select-favorite', artist.documentId)"
    >
      <template #footer>
        <q-btn
          rounded
          flat
          dense
          color="primary"
          class="bg-block full-width"
          :loading="canceling"
          :disable="canceling"
          @click.stop="$emit('cancel-invite', artist)"
        >
          <div class="flex items-center q-gap-sm">
            <q-icon name="cancel" size="18px" />
            <span>Cancel Invite</span>
          </div>
        </q-btn>
      </template>
    </ArtistCard>
  </div>

  <!-- Empty State -->
  <div v-else class="empty-state bg-block border-radius-lg">
    <q-icon name="people" size="60px" color="grey-6" />
    <h3 class="empty-title">{{ noDataTitle || 'No Artists Yet' }}</h3>
    <p class="empty-description text-grey-6">{{ noDataDescription || 'Invite your first artist to showcase their work' }}</p>
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
  pendingDocumentIds?: string[];
  canceling?: boolean;
  noDataTitle?: string;
  noDataDescription?: string;
  noDataButtonLabel?: string;
}

interface Emits {
  (e: 'select-artist', artist: IArtist): void;
  (e: 'select-favorite', artistDocumentId: string): void;
  (e: 'open-invite-dialog'): void;
  (e: 'cancel-invite', artist: IArtist): void;
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
