<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <AddressRequestDialog
      v-model="showAddressDialog"
      @dismiss="handleDismissAddressDialog"
      description="Adding your address will allow you to sort the nearest artists and shops to you"
      @fill-address="handleFillAddress"
    />
    <div class="container">
      <ProfileHeader
        class="q-mb-md"
        sub-title="My Profile"
        :name="user?.name || user?.username || 'Guest'"
      />
    </div>

    <div class="container">
      <AboutMeTab />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import AboutMeTab from 'src/components/Profile/AboutMeTab.vue';
import ProfileHeader from 'src/components/Profile/ProfileHeader.vue';
import useUser from 'src/modules/useUser';
import { useRouter } from 'vue-router';
import AddressRequestDialog from 'src/components/Dialogs/AddressRequestDialog.vue';
import { useAddressRequestDialog } from 'src/composables/useAddressRequestDialog';

const { user, isGuest } = useUser();

const router = useRouter();

const {
  showAddressDialog,
  dismissAddressDialog: handleDismissAddressDialog,
  fillAddress: handleFillAddress,
} = useAddressRequestDialog({
  user,
  enabled: isGuest,
  onFillAddress: () => {
    void router.push('/profile/location');
  },
});
</script>
