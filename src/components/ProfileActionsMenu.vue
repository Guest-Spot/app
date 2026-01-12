<template>
  <q-btn round flat icon="more_vert" class="bg-block">
    <q-menu style="width: 200px" anchor="bottom right" self="top right" :offset="[0, 4]">
      <q-list>
        <q-item clickable v-close-popup @click="copyProfileLink">
          <q-item-section>
            <div class="flex items-center q-gap-sm">
              <q-icon name="content_copy" size="18px" />
              <q-item-label>Copy profile link</q-item-label>
            </div>
          </q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="shareProfile">
          <q-item-section>
            <div class="flex items-center q-gap-sm">
              <q-icon name="share" size="18px" />
              <q-item-label>Share this profile</q-item-label>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
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
</script>

