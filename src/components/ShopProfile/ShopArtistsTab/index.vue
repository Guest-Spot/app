<template>
  <div class="shop-artists-tab">
    <!-- Artists List -->
    <div class="artists-section">
      <div class="section-header q-mb-md bg-block border-radius-md">
        <div class="flex q-gap-xs">
          <TabsComp
            size="sm"
            unelevated
            send-initial-tab
            :tabs="filterTabs"
            :activeTab="activeFilter"
            @set-active-tab="setActiveFilter"
          />
        </div>
        <q-btn
          color="primary"
          icon="person_add"
          flat
          @click="showAddArtistDialog = true"
          round
          class="bg-block"
          size="sm"
          unelevated
        />
      </div>

      <!-- Artists Grid -->
      <ArtistsList
        v-show="activeFilter?.tab === PENDING_TAB"
        :artists="invitedArtists"
        @select-artist="handleArtistClick"
        @select-favorite="handleFavoriteToggle"
        @open-invite-dialog="showAddArtistDialog = true"
      />
      <ArtistsList
        v-show="activeFilter?.tab === ACCEPTED_TAB"
        :artists="artists"
        @select-artist="handleArtistClick"
        @select-favorite="handleFavoriteToggle"
        @open-invite-dialog="showAddArtistDialog = true"
      />
    </div>

    <!-- Invite Artist Dialog -->
    <ArtistInviteDialog
      v-model="showAddArtistDialog"
      :shop-id="shopId"
      :invited-document-ids="invitedDocumentIds"
      :pending-document-ids="pendingDocumentIds"
      @artist-invited="handleArtistInvited"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { ArtistInviteDialog } from 'src/components/Dialogs';
import { SHOP_ARTISTS_QUERY } from 'src/apollo/types/shop';
import { ARTISTS_QUERY } from 'src/apollo/types/artist';
import { INVITES_QUERY } from 'src/apollo/types/invite';
import { useLazyQuery } from '@vue/apollo-composable';
import type { IGraphQLShopArtistsResult } from 'src/interfaces/shop';
import type { IGraphQLArtistsResult, IArtist } from 'src/interfaces/artist';
import { useProfileStore } from 'src/stores/profile';
import type { ITab } from 'src/interfaces/tabs';
import ArtistsList from 'src/components/ShopProfile/ShopArtistsTab/ArtistsList.vue';
import TabsComp from 'src/components/TabsComp.vue';
import type { IGraphQLInvitesResult } from 'src/interfaces/invite';

const ACCEPTED_TAB = 'accepted';
const PENDING_TAB = 'pending';

const {
  load: loadShopArtists,
  onResult: onResultShopArtists,
  onError: onErrorShopArtists,
  refetch: refetchShopArtists,
} = useLazyQuery<IGraphQLShopArtistsResult>(SHOP_ARTISTS_QUERY);

const {
  load: loadInvitedShopArtists,
  onResult: onResultInvitedShopArtists,
  onError: onErrorInvitedShopArtists,
} = useLazyQuery<IGraphQLArtistsResult>(ARTISTS_QUERY);

const {
  load: loadInvites,
  onResult: onResultInvites,
  onError: onErrorInvites,
} = useLazyQuery<IGraphQLInvitesResult>(INVITES_QUERY);
const profileStore = useProfileStore();

// Artists data
const artists = ref<IArtist[]>([]);
const showAddArtistDialog = ref(false);
const shopId = ref(1);
const invitedArtists = ref<IArtist[]>([]);

const invitedDocumentIds = computed(() => artists.value.map((artist) => artist.documentId));
const pendingDocumentIds = computed(() => invitedArtists.value.map((artist) => artist.documentId));
const filterTabs = computed<ITab[]>(() => [
  { label: 'Accepted', tab: ACCEPTED_TAB, count: artists.value.length },
  { label: 'Pending', tab: PENDING_TAB, count: invitedArtists.value.length },
]);

const activeFilter = ref<ITab>(filterTabs.value[0]!);

const setActiveFilter = (filter: ITab) => {
  activeFilter.value = filter;
};

const handleArtistClick = (artist: IArtist) => {
  console.log('Artist clicked:', artist);
};

const handleFavoriteToggle = (artistDocumentId: string) => {
  console.log('Favorite toggled for artist:', artistDocumentId);
};

const handleArtistInvited = () => {
  void refetchShopArtists();
};

onResultShopArtists(({ data }) => {
  artists.value = data.shopArtists;
});

onErrorShopArtists((error) => {
  console.error('Error fetching invites:', error);
});

onResultInvites(({ data }) => {
  void loadInvitedShopArtists(null, {
    filters: {
      documentId: {
        in: data.invites.map((invite) => invite.recipient),
      },
    },
  }, { fetchPolicy: 'network-only' });
});

onErrorInvites((error) => {
  console.error('Error fetching invites:', error);
});

onResultInvitedShopArtists(({ data }) => {
  invitedArtists.value = data?.artists || [];
});

onErrorInvitedShopArtists((error) => {
  console.error('Error fetching invited artists:', error);
});

watch(() => profileStore.getShopProfile, (newProfile) => {
  if (newProfile) {
    void loadShopArtists(null, {
      documentId: newProfile.documentId,
    }, { fetchPolicy: 'network-only' });
    void loadInvites(null, {}, { fetchPolicy: 'network-only' });
  }
}, { immediate: true });

// Expose data for parent component
defineExpose({
  artists,
});

defineOptions({
  name: 'ShopArtistsTab',
});
</script>

<style scoped lang="scss">
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 4px 4px 16px;
}

.section-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}
</style>
