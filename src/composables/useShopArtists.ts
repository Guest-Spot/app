import { ref } from 'vue';
import type { IArtist } from 'src/interfaces/artist';
import { useQuasar } from 'quasar';
import useNotify from 'src/modules/useNotify';
import { useMutation } from '@vue/apollo-composable';
import { CREATE_INVITE_MUTATION } from 'src/apollo/types/invite';
import type { IShop } from 'src/interfaces/shop';

const useShopArtists = () => {
  const $q = useQuasar();
  const { showError } = useNotify();

  const {
    mutate: createInviteMutation,
    loading: invitingArtist,
    onDone: onInviteSuccess,
    onError: onInviteError,
  } = useMutation(CREATE_INVITE_MUTATION);

  const shopArtists = ref<IArtist[]>([]);

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
        showError('Shop ID is required to send invitation');
        return;
      }
      void createInviteMutation({
        data: {
          title: `Join Our Team at ${shop.name}`,
          description: `Hey ${artist.name}! We would love to welcome you to our creative team at ${shop.name}. Your unique style would be a perfect addition to our shop. Looking forward to working together!`,
          sender: shop.documentId,
          recipient: artist.documentId,
        },
      });
    });
  };

  return {
    shopArtists,
    inviteArtist,
    invitingArtist,
    onInviteSuccess,
    onInviteError,
  };
};

export default useShopArtists;
