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
  <NoResult
    v-else
    icon="people"
    :title="noDataTitle || 'No artists yet'"
    :description="noDataDescription || 'Invite your first artist to showcase their work'"
    :btn-label="noDataButtonLabel || 'Invite First Artist'"
    btn-icon="person_add"
    @click-btn="$emit('open-invite-dialog')"
  />
</template>

<script setup lang="ts">
import { ArtistCard } from 'src/components/SearchPage/index';
import type { IArtist } from 'src/interfaces/artist';
import NoResult from 'src/components/NoResult.vue';

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
