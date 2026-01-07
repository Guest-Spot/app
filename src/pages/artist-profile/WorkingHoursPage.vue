<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="$router.back()" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">Working <span class="text-primary">Hours</span></h2>
    </div>

    <div class="content-wrapper full-width q-pb-xl">
      <div class="container">
        <div class="working-hours-container">
          <WorkingHoursEditor v-model="localHours" />
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <SaveButton :has-changes="!!hasChanges" :loading="loading" @save="handleSave" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { IOpeningHours } from 'src/interfaces/common';
import useNotify from 'src/modules/useNotify';
import useUser from 'src/modules/useUser';
import useOpeningHours from 'src/modules/useOpeningHours';
import WorkingHoursEditor from 'src/components/ShopProfile/WorkingHoursEditor.vue';
import SaveButton from 'src/components/SaveButton.vue';

const router = useRouter();
const { showSuccess, showError } = useNotify();
const { fetchMe, user } = useUser();
const { fetchOpeningHours, handleOpeningHoursChanges } = useOpeningHours();

const loading = ref(false);
const localHours = reactive<IOpeningHours[]>([]);
const originalHours = ref<IOpeningHours[]>([]);

// Fetch opening hours
const userDocumentId = computed(() => user.value?.documentId);
const { refetch: refetchOpeningHours, onResult: onResultOpeningHours } = fetchOpeningHours(userDocumentId);

onResultOpeningHours((result) => {
  if (result.data?.openingHours) {
    const hours = [...result.data.openingHours];
    localHours.splice(0, localHours.length, ...hours);
    originalHours.value = JSON.parse(JSON.stringify(hours));
  }
});

const hasChanges = computed(() => {
  return JSON.stringify([...localHours]) !== JSON.stringify(originalHours.value);
});

const handleSave = async () => {
  if (!user.value?.id) {
    showError('User not found');
    return;
  }

  loading.value = true;

  try {
    await handleOpeningHoursChanges(originalHours.value, [...localHours], user.value.id);
    await Promise.all([fetchMe(), refetchOpeningHours()]);
    showSuccess('Working hours successfully updated');
    router.back();
  } catch (error) {
    console.error('Error updating working hours:', error);
    showError('Error updating working hours');
  } finally {
    loading.value = false;
  }
};
</script>


<style scoped>
.content-wrapper {
  padding-bottom: 100px;
}


.working-hours-container {
  width: 100%;
}
</style>

