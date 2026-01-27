<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="$router.back()" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">
        Create Guest Spot <span class="text-primary">Slot</span>
      </h2>
    </div>

    <div class="content-wrapper full-width q-pb-xl">
      <div class="container">
        <div class="text-center full-width bg-block border-radius-lg q-pa-lg">
          <GuestSpotSlotForm
            :loading="isCreatingSlot"
            @submit="handleSubmit"
            @cancel="handleCancel"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { IGuestSpotSlotForm } from 'src/interfaces/guestSpot';
import useGuestSpot from 'src/composables/useGuestSpot';
import useUser from 'src/modules/useUser';
import GuestSpotSlotForm from 'src/components/ShopProfile/GuestSpotTab/GuestSpotSlotForm.vue';

defineOptions({
  name: 'CreateGuestSpotSlotPage',
});

const router = useRouter();
const { user } = useUser();
const { createSlot, isCreatingSlot } = useGuestSpot();

const handleSubmit = async (data: IGuestSpotSlotForm) => {
  if (!user.value?.documentId) return;

  const slot = await createSlot(data);
  if (slot) {
    // Navigate to guest spot management page
    void router.push('/profile/guest-spot');
  }
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.content-wrapper {
  padding-bottom: 100px;
}
</style>
