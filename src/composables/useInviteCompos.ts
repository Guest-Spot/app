import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import useNotify from 'src/modules/useNotify';
import { useMutation, useLazyQuery } from '@vue/apollo-composable';
import {
  CREATE_INVITE_MUTATION,
  DELETE_INVITE_MUTATION,
  INVITES_QUERY,
} from 'src/apollo/types/invite';
import type { IUser } from 'src/interfaces/user';
import { EReactions, InviteType } from 'src/interfaces/enums';
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

  const shopArtists = ref<IUser[]>([]);

  const receivedPendingInvites = computed(() =>
    invitesStore.getInvites.filter(
      (invite) =>
        invite.reaction === EReactions.Pending &&
        invite.recipient.documentId === userStore.getUser?.documentId,
    ),
  );

  const sentPendingInvites = computed(() =>
    invitesStore.getInvites.filter(
      (invite) =>
        invite.reaction === EReactions.Pending && invite.sender.documentId === userStore.getUser?.documentId,
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
                documentId: {
                  eq: userStore.getUser?.documentId,
                }
              },
            },
            {
              recipient: {
                documentId: {
                  eq: userStore.getUser?.documentId,
                },
              },
            },
          ],
        },
        sort: ['createdAt:desc'],
      },
      { fetchPolicy: 'network-only' },
    );
  };

  const inviteArtist = (shop: IUser, artist: IUser) => {
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
          type: InviteType.InviteCreated,
        },
      });
    });
  };

  const cancelInvite = (shop: IUser, artist: IUser, inviteDocumentId: string) => {
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
    const sortedInvites = result?.data?.invites
      ? [...result.data.invites].sort((a: IInvite, b: IInvite) => {
          if (a.reaction === EReactions.Pending && b.reaction !== EReactions.Pending) {
            return -1; // a comes before b
          }
          if (a.reaction !== EReactions.Pending && b.reaction === EReactions.Pending) {
            return 1; // b comes before a
          }
          return 0; // maintain original order for same reaction types
        })
      : [];
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
