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
          :loading="removing"
          :disable="removing"
          @click.stop="$emit('remove-artist', artist)"
        >
          <div class="flex items-center q-gap-sm">
            <q-icon name="cancel" size="18px" />
            <span>Remove from shop</span>
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
import type { IUser } from 'src/interfaces/user';
import { NoResult } from 'src/components';

interface Props {
  artists: IUser[];
  removing?: boolean;
  noDataTitle?: string;
  noDataDescription?: string;
  noDataButtonLabel?: string;
}

interface Emits {
  (e: 'select-artist', artist: IUser): void;
  (e: 'select-favorite', artistDocumentId: string): void;
  (e: 'open-invite-dialog'): void;
  (e: 'remove-artist', artist: IUser): void;
}

defineProps<Props>();
defineEmits<Emits>();

defineOptions({
  name: 'ArtistsList',
});
</script>

<script lang="ts">
export default {
  name: 'ArtistsList',
};
</script>
