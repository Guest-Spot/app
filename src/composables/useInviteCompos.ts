import { computed, ref } from 'vue';
import type { IArtist } from 'src/interfaces/artist';
import { useQuasar } from 'quasar';
import useNotify from 'src/modules/useNotify';
import { useMutation, useLazyQuery } from '@vue/apollo-composable';
import {
  CREATE_INVITE_MUTATION,
  DELETE_INVITE_MUTATION,
  INVITES_QUERY,
} from 'src/apollo/types/invite';
import type { IShop } from 'src/interfaces/shop';
import { InviteReaction, InviteType } from 'src/interfaces/enums';
import { useInvitesStore } from 'src/stores/invites';
import { useUserStore } from 'src/stores/user';
import type { IInvite } from 'src/interfaces/invite';

const useInviteCompos = () => {
  const $q = useQuasar();
  const { showError } = useNotify();
  const invitesStore = useInvitesStore();
  const userStore = useUserStore();

  const {
    mutate: createInviteMutation,
    loading: invitingArtist,
    onDone: onInviteSuccess,
    onError: onInviteError,
  } = useMutation(CREATE_INVITE_MUTATION);
  const {
    mutate: deleteInviteMutation,
    loading: deletingInvite,
    onDone: onDeleteInviteSuccess,
    onError: onDeleteInviteError,
  } = useMutation(DELETE_INVITE_MUTATION);

  const {
    load: loadInvites,
    onResult: onResultInvites,
    onError: onErrorInvites,
    refetch: refetchInvites,
  } = useLazyQuery(INVITES_QUERY);

  const shopArtists = ref<IArtist[]>([]);

  const receivedPendingInvites = computed(() =>
    invitesStore.getInvites.filter(
      (invite) =>
        invite.reaction === InviteReaction.Pending &&
        invite.recipient === userStore.getUser?.profile?.documentId,
    ),
  );

  const sentPendingInvites = computed(() =>
    invitesStore.getInvites.filter(
      (invite) =>
        invite.reaction === InviteReaction.Pending &&
        invite.sender === userStore.getUser?.profile?.documentId,
    ),
  );

  const fetchInvites = (filters: unknown = {}) => {
    void loadInvites(
      null,
      {
        filters: {
          ...(filters || {}),
          or: [
            {
              sender: {
                eq: userStore.getUser?.profile?.documentId,
              },
            },
            {
              recipient: {
                eq: userStore.getUser?.profile?.documentId,
              },
            },
          ],
        },
        sort: ['createdAt:desc'],
      },
      { fetchPolicy: 'network-only' },
    );
  };

  const inviteArtist = (shop: IShop, artist: IArtist) => {
    $q.dialog({
      title: 'Invite Artist',
      message: `Are you sure you want to invite <strong class="text-primary">${artist.name}</strong> to your shop?`,
      persistent: true,
      html: true,
      ok: {
        label: 'Yes, Invite',
        color: 'primary',
        rounded: true,
        unelevated: true,
      },
      cancel: {
        label: 'Cancel',
        color: 'grey-9',
        rounded: true,
      },
    }).onOk(() => {
      if (!shop.documentId) {
        showError('Something went wrong');
        console.error('Shop ID is required to send invitation');
        return;
      }
      void createInviteMutation({
        data: {
          title: `Join Our Team at ${shop.name}`,
          description: `Hey ${artist.name}! We would love to welcome you to our creative team at ${shop.name}. Your unique style would be a perfect addition to our shop. Looking forward to working together!`,
          sender: shop.documentId,
          recipient: artist.documentId,
          type: InviteType.ArtistToShop,
        },
      });
    });
  };

  const cancelInvite = (shop: IShop, artist: IArtist, inviteDocumentId: string) => {
    $q.dialog({
      title: 'Cancel Invite',
      message: `Are you sure you want to cancel the invite for <strong class="text-primary">${artist.name}</strong>?`,
      persistent: true,
      html: true,
      ok: {
        label: 'Yes, Cancel',
        color: 'primary',
        rounded: true,
        unelevated: true,
      },
      cancel: {
        label: 'No, Keep It',
        color: 'grey-9',
        rounded: true,
      },
    }).onOk(() => {
      if (!shop.documentId) {
        showError('Something went wrong');
        console.error('Shop ID is required to cancel invite');
        return;
      }
      if (!inviteDocumentId) {
        showError('Something went wrong');
        console.error('Invite document ID is required to cancel invite');
        return;
      }
      void deleteInviteMutation({
        documentId: inviteDocumentId,
      });
    });
  };

  onResultInvites((result) => {
    const sortedInvites = result?.data?.invites ? [...result.data.invites].sort((a: IInvite, b: IInvite) => {
      if (a.reaction === InviteReaction.Pending && b.reaction !== InviteReaction.Pending) {
        return -1; // a comes before b
      }
      if (a.reaction !== InviteReaction.Pending && b.reaction === InviteReaction.Pending) {
        return 1; // b comes before a
      }
      return 0; // maintain original order for same reaction types
    }) : [];
    console.log('sortedInvites', sortedInvites);
    invitesStore.setInvites(sortedInvites);
  });

  return {
    shopArtists,
    inviteArtist,
    invitingArtist,
    onInviteSuccess,
    onInviteError,
    deletingInvite,
    onDeleteInviteSuccess,
    onDeleteInviteError,
    cancelInvite,
    fetchInvites,
    refetchInvites,
    onResultInvites,
    onErrorInvites,
    receivedPendingInvites,
    sentPendingInvites,
  };
};

export default useInviteCompos;
