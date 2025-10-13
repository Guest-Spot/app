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
        :removing="removingArtist"
        @select-artist="handleArtistClick"
        @select-favorite="handleFavoriteToggle"
        @open-invite-dialog="showAddArtistDialog = true"
        @remove-artist="handleRemoveArtist"
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
import { USER_CHILDS_QUERY } from 'src/apollo/types/user';
import { USERS_QUERY } from 'src/apollo/types/user';
import { useLazyQuery, useMutation } from '@vue/apollo-composable';
import type { IGraphQLUserChildsResult } from 'src/interfaces/user';
import type { IGraphQLUsersResult, IUser } from 'src/interfaces/user';
import type { ITab } from 'src/interfaces/tabs';
import { TabsComp } from 'src/components';
import useInviteCompos from 'src/composables/useInviteCompos';
import useNotify from 'src/modules/useNotify';
import type { IInvite } from 'src/interfaces/invite';
import { useInvitesStore } from 'src/stores/invites';
import { UPDATE_SHOP_MUTATION } from 'src/apollo/types/mutations/shop';
import { default as ArtistsList } from './ArtistsList.vue';
import { default as PendingList } from './PendingList.vue';
import { useQuasar } from 'quasar';
import useUser from 'src/modules/useUser';

const ACCEPTED_TAB = 'accepted';
const PENDING_TAB = 'pending';

const {
  load: loadShopArtists,
  onResult: onResultShopArtists,
  onError: onErrorShopArtists,
} = useLazyQuery<IGraphQLUserChildsResult>(USER_CHILDS_QUERY);

const {
  load: loadPendingShopArtists,
  onResult: onResultPendingShopArtists,
  onError: onErrorPendingShopArtists,
} = useLazyQuery<IGraphQLUsersResult>(USERS_QUERY);

const invitesStore = useInvitesStore();
const { cancelInvite, onDeleteInviteSuccess, onDeleteInviteError, sentPendingInvites } =
  useInviteCompos();
const { showError, showSuccess } = useNotify();
const $q = useQuasar();
const { user } = useUser();

// Setup mutation for removing artist
const { mutate: updateShop, onDone: onDoneUpdateShop } = useMutation(UPDATE_SHOP_MUTATION);

// Artists data
const artists = ref<IUser[]>([]);
const showAddArtistDialog = ref(false);
const pendingArtists = ref<IUser[]>([]);
const documentIdForDelete = ref<string>('');
const removingArtist = ref(false);

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

const handleArtistClick = (artist: IUser) => {
  console.log('Artist clicked:', artist);
};

const handleFavoriteToggle = (artistDocumentId: string) => {
  console.log('Favorite toggled for artist:', artistDocumentId);
};

const handleArtistInvited = (invite: IInvite, artist: IUser) => {
  pendingArtists.value = [...pendingArtists.value, artist];
  invitesStore.setInvites([...invitesStore.getInvites, invite]);
};

const handleCancelInvite = (artist: IUser) => {
  documentIdForDelete.value = artist.documentId;
  if (!user.value) {
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
  void cancelInvite(user.value, artist, inviteDocumentId);
};

const handleRemoveArtist = (artist: IUser) => {
  if (!user.value) {
    showError('Shop profile not found');
    console.error('Shop profile not found');
    return;
  }

  $q.dialog({
    title: 'Remove Artist',
    message: `Are you sure you want to remove <strong class="text-primary">${artist.name}</strong> from your shop?`,
    html: true,
    cancel: {
      color: 'grey-9',
      rounded: true,
      label: 'No, Keep It',
    },
    ok: {
      color: 'primary',
      rounded: true,
      label: 'Yes, Remove',
    },
  }).onOk(() => {
    removingArtist.value = true;
    documentIdForDelete.value = artist.documentId;

    // Filter out the artist to be removed
    const updatedArtists = artists.value
      .filter((a) => a.documentId !== artist.documentId)
      .map((a) => a.documentId);

    void updateShop({
      documentId: user.value?.documentId,
      data: {
        artists: updatedArtists,
      },
    });
  });
};

onResultShopArtists(({ data }) => {
  artists.value = data.shopArtists;
});

onErrorShopArtists((error) => {
  console.error('Error fetching invites:', error);
});

onResultPendingShopArtists(({ data }) => {
  pendingArtists.value = data?.usersPermissionsUsers || [];
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

onDoneUpdateShop((result) => {
  if (result.errors?.length) {
    console.error('Error updating shop:', result.errors);
    showError('Error removing artist from shop');
    removingArtist.value = false;
    return;
  }

  if (result.data?.updateShop) {
    // Remove artist from local state
    const artistForRemove = artists.value.find(
      (artist) => artist.documentId === documentIdForDelete.value,
    );
    artists.value = artists.value.filter(
      (artist) => artist.documentId !== documentIdForDelete.value,
    );
    showSuccess(`${artistForRemove?.name} removed from shop successfully`);
    removingArtist.value = false;
    documentIdForDelete.value = '';
  }
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
  user,
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
  padding: 4px 4px;
}

.section-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}
</style>
