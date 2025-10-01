<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="container">
      <ProfileHeader
        class="q-mb-md"
        :name="profile?.email || ''"
        @openPublicProfile="openPublicProfile"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProfileHeader from 'src/components/Profile/ProfileHeader.vue';
import { useProfileStore } from 'src/stores/profile';
import { useRouter } from 'vue-router';

const profileStore = useProfileStore();
const profile = computed(() => profileStore.getGuestProfile);

const router = useRouter();

const openPublicProfile = () => {
  void router.push(`/artist/${profile.value?.documentId}`);
};
</script>
