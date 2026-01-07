<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="container">
      <ProfileHeader
        class="q-mb-md"
        sub-title="My Profile"
        :name="user?.name || user?.username || 'Guest'"
        @openPublicProfile="openPublicProfile"
      />
    </div>

    <div class="container">
      <AboutMeTab />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import AboutMeTab from 'src/components/GuestProfile/AboutMeTab.vue';
import ProfileHeader from 'src/components/Profile/ProfileHeader.vue';
import useUser from 'src/modules/useUser';
import { useRouter } from 'vue-router';

const { user } = useUser();

const router = useRouter();

const openPublicProfile = () => {
  void router.push(`/artist/${user.value?.documentId}`);
};
</script>
