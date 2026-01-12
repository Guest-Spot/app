<template>
  <q-btn round flat icon="more_vert" class="bg-block" @click="showMenu = true" />
  <q-dialog v-model="showMenu" position="bottom" no-route-dismiss>
    <q-card class="profile-actions-menu">
      <div class="q-px-md q-py-lg flex column q-gap-md">
        <q-btn class="bg-block" rounded unelevated @click="handleCopyProfileLink">
          <div class="flex items-center q-gap-sm q-pa-sm">
            <q-icon name="content_copy" size="18px" />
            <span>Copy profile link</span>
          </div>
        </q-btn>
        <q-btn class="bg-block" rounded unelevated @click="handleShareProfile">
          <div class="flex items-center q-gap-sm q-pa-sm">
            <q-icon name="share" size="18px" />
            <span>Share this profile</span>
          </div>
        </q-btn>
      </div>
      <q-card-actions class="dialog-actions bg-block">
        <q-btn
          color="grey-9"
          rounded
          unelevated
          class="full-width bg-block"
          v-close-popup
        >
          <div class="q-pa-sm">Cancel</div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { copyToClipboard } from 'quasar';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import useNotify from 'src/modules/useNotify';

defineOptions({
  name: 'ProfileActionsMenu',
});

interface Props {
  documentId: string;
  name?: string;
  type: 'artist' | 'shop';
}

const props = defineProps<Props>();
const { showError, showSuccess } = useNotify();
const showMenu = ref(false);

const getProfileUrl = (): string => {
  if (!props.documentId) return '';
  const profilePath = `/${props.type}/${props.documentId}`;
  return `${window.location.origin}${window.location.pathname}#${profilePath}`;
};

const copyProfileLink = async () => {
  const url = getProfileUrl();
  if (!url) {
    showError('Unable to generate profile link');
    return;
  }
  try {
    await copyToClipboard(url);
    showSuccess('Link copied to clipboard');
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    showError('Failed to copy link');
  }
};

const handleCopyProfileLink = async () => {
  showMenu.value = false;
  await copyProfileLink();
};

const shareProfile = async () => {
  const url = getProfileUrl();
  if (!url) {
    showError('Unable to generate profile link');
    return;
  }

  const profileTypeLabel = props.type === 'artist' ? 'artist' : 'shop';
  const title = props.name || `${profileTypeLabel.charAt(0).toUpperCase() + profileTypeLabel.slice(1)} Profile`;
  const text = `Check out ${props.name || `this ${profileTypeLabel}`} on GuestSpot`;

  try {
    if (Capacitor.isNativePlatform()) {
      // Use Capacitor Share plugin on native platforms
      await Share.share({
        title,
        text,
        url,
        dialogTitle: 'Share profile',
      });
    } else if (navigator.share) {
      // Use Web Share API on web platforms
      await navigator.share({
        title,
        text,
        url,
      });
    } else {
      // Fallback to copy if Share API is not available
      await copyProfileLink();
    }
  } catch (error) {
    // User cancelled or error occurred
    if ((error as Error).name !== 'AbortError') {
      console.error('Error sharing:', error);
    }
  }
};

const handleShareProfile = async () => {
  showMenu.value = false;
  await shareProfile();
};
</script>

<style scoped lang="scss">
.profile-actions-menu {
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.dialog-actions {
  padding: 16px 20px 32px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);

  .dialog-actions__controls {
    width: 100%;
    display: flex;
    gap: 12px;
  }
}
</style>
