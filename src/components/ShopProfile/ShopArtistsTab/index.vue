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
      <PendingList
        v-show="activeFilter?.tab === PENDING_TAB"
        :artists="pendingArtists"
        :pending-document-ids="pendingDocumentIds"
        @select-artist="handleArtistClick"
        @select-favorite="handleFavoriteToggle"
        @open-invite-dialog="showAddArtistDialog = true"
        @cancel-invite="handleCancelInvite"
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
import { useLazyQuery } from '@vue/apollo-composable';
import type { IGraphQLShopArtistsResult } from 'src/interfaces/shop';
import type { IGraphQLArtistsResult, IArtist } from 'src/interfaces/artist';
import { useProfileStore } from 'src/stores/profile';
import type { ITab } from 'src/interfaces/tabs';
import ArtistsList from 'src/components/ShopProfile/ShopArtistsTab/ArtistsList.vue';
import PendingList from 'src/components/ShopProfile/ShopArtistsTab/PendingList.vue';
import TabsComp from 'src/components/TabsComp.vue';
import useInviteCompos from 'src/composables/useInviteCompos';
import useNotify from 'src/modules/useNotify';
import type { IInvite } from 'src/interfaces/invite';
import { useInvitesStore } from 'src/stores/invites';

const ACCEPTED_TAB = 'accepted';
const PENDING_TAB = 'pending';

const {
  load: loadShopArtists,
  onResult: onResultShopArtists,
  onError: onErrorShopArtists,
} = useLazyQuery<IGraphQLShopArtistsResult>(SHOP_ARTISTS_QUERY);

const {
  load: loadPendingShopArtists,
  onResult: onResultPendingShopArtists,
  onError: onErrorPendingShopArtists,
} = useLazyQuery<IGraphQLArtistsResult>(ARTISTS_QUERY);

const profileStore = useProfileStore();
const invitesStore = useInvitesStore();
const { cancelInvite, onDeleteInviteSuccess, onDeleteInviteError, sentPendingInvites } =
  useInviteCompos();
const { showError, showSuccess } = useNotify();

// Artists data
const artists = ref<IArtist[]>([]);
const showAddArtistDialog = ref(false);
const pendingArtists = ref<IArtist[]>([]);
const documentIdForDelete = ref<string>('');

const invitedDocumentIds = computed(() => artists.value.map((artist) => artist.documentId));
const pendingDocumentIds = computed(() => pendingArtists.value.map((artist) => artist.documentId));
const filterTabs = computed<ITab[]>(() => [
  { label: 'Accepted', tab: ACCEPTED_TAB, count: artists.value.length },
  { label: 'Pending', tab: PENDING_TAB, count: pendingArtists.value.length },
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

const handleArtistInvited = (invite: IInvite, artist: IArtist) => {
  pendingArtists.value = [...pendingArtists.value, artist];
  invitesStore.setInvites([...invitesStore.getInvites, invite]);
};

const handleCancelInvite = (artist: IArtist) => {
  const shop = profileStore.shopProfile;
  documentIdForDelete.value = artist.documentId;
  if (!shop) {
    showError('Shop profile not found');
    console.error('Shop profile not found');
    return;
  }
  const inviteDocumentId = sentPendingInvites.value.find(
    (invite) => invite.recipient === artist.documentId,
  )?.documentId;
  if (!inviteDocumentId) {
    showError('Invite document ID not found');
    console.error('Invite document ID not found');
    return;
  }
  void cancelInvite(shop, artist, inviteDocumentId);
};

onResultShopArtists(({ data }) => {
  artists.value = data.shopArtists;
});

onErrorShopArtists((error) => {
  console.error('Error fetching invites:', error);
});

onResultPendingShopArtists(({ data }) => {
  pendingArtists.value = data?.artists || [];
});

onErrorPendingShopArtists((error) => {
  console.error('Error fetching invited artists:', error);
});

onDeleteInviteSuccess(({ data }) => {
  pendingArtists.value = pendingArtists.value.filter(
    (artist) => artist.documentId !== documentIdForDelete.value,
  );
  showSuccess('Invite canceled successfully');
  documentIdForDelete.value = '';
  invitesStore.setInvites(
    invitesStore.getInvites.filter((invite) => invite.documentId !== data.deleteInvite.documentId),
  );
});

onDeleteInviteError((error) => {
  console.error('Error canceling invite:', error);
});

watch(sentPendingInvites, (newPendingInvites) => {
  if (newPendingInvites.length > 0) {
    void loadPendingShopArtists(
      null,
      {
        filters: {
          documentId: {
            in: newPendingInvites.map((invite) => invite.recipient),
          },
        },
      },
      { fetchPolicy: 'network-only' },
    );
  }
});

watch(
  () => profileStore.getShopProfile,
  (newProfile) => {
    if (newProfile) {
      void loadShopArtists(
        null,
        {
          documentId: newProfile.documentId,
        },
        { fetchPolicy: 'network-only' },
      );
    }
  },
  { immediate: true },
);

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
