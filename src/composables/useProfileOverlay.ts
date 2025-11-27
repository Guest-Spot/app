import { ref, readonly } from 'vue';

export type ProfileType = 'artist' | 'shop';

interface ProfileOverlayState {
  isOpen: boolean;
  type: ProfileType | null;
  documentId: string | null;
}

const state = ref<ProfileOverlayState>({
  isOpen: false,
  type: null,
  documentId: null,
});

export function useProfileOverlay() {
  const openArtistProfile = (documentId: string) => {
    state.value = {
      isOpen: true,
      type: 'artist',
      documentId,
    };
  };

  const openShopProfile = (documentId: string) => {
    state.value = {
      isOpen: true,
      type: 'shop',
      documentId,
    };
  };

  const closeProfile = () => {
    state.value = {
      isOpen: false,
      type: null,
      documentId: null,
    };
  };

  return {
    state: readonly(state),
    openArtistProfile,
    openShopProfile,
    closeProfile,
  };
}

