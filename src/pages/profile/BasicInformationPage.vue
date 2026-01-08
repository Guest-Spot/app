<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="$router.back()" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">Basic <span class="text-primary">Information</span></h2>
    </div>

    <div class="content-wrapper full-width q-pb-xl">
      <div class="container">
        <div class="text-center full-width bg-block border-radius-lg q-pa-lg">
          <q-form @submit.prevent="handleSave" class="flex column items-start q-gap-sm full-width">
            <div class="flex column items-start q-gap-xs full-width">
              <label class="input-label">Name</label>
              <q-input
                v-model="formData.name"
                type="text"
                placeholder="Enter name"
                outlined
                rounded
                size="lg"
                :rules="nameRules"
                class="full-width"
                bg-color="transparent"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="grey-6" />
                </template>
              </q-input>
            </div>

            <div class="flex column items-start q-gap-xs full-width">
              <label class="input-label">Bio</label>
              <q-input
                v-model="formData.description"
                type="textarea"
                placeholder="Tell us about yourself..."
                outlined
                rounded
                size="lg"
                rows="4"
                autogrow
                class="full-width"
                bg-color="transparent"
              >
                <template v-slot:prepend>
                  <q-icon name="description" color="grey-6" />
                </template>
              </q-input>
            </div>
          </q-form>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <SaveButton :has-changes="!!hasChanges" :loading="loading" @save="handleSave" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMutation } from '@vue/apollo-composable';
import { UPDATE_USER_MUTATION } from 'src/apollo/types/user';
import useNotify from 'src/modules/useNotify';
import useUser from 'src/modules/useUser';
import SaveButton from 'src/components/SaveButton.vue';

const router = useRouter();
const { showSuccess, showError } = useNotify();
const { fetchMe, user } = useUser();

const loading = ref(false);
const formData = ref({
  name: '',
  description: '',
});

const nameRules = [(val: string) => !!val || 'Name is required'];

// Load user data
watch(
  user,
  (profile) => {
    if (profile) {
      formData.value = {
        name: profile.name || '',
        description: profile.description || '',
      };
    }
  },
  { immediate: true },
);

const { mutate: updateUser, onDone: onDoneUpdate } = useMutation(UPDATE_USER_MUTATION);

const hasChanges = computed(() => {
  return formData.value.name !== user.value?.name || formData.value.description !== user.value?.description;
});

onDoneUpdate((result) => {
  loading.value = false;
  if (result.errors?.length) {
    console.error('Error updating user:', result.errors);
    showError('Error updating profile');
    return;
  }

  if (result.data?.updateUsersPermissionsUser) {
    void fetchMe().then(() => {
      showSuccess('Your profile successfully updated');
      router.back();
    });
  }
});

const handleSave = async () => {
  if (!user.value?.id) {
    showError('User not found');
    return;
  }

  loading.value = true;

  const data: Record<string, unknown> = {};
  if (formData.value.name !== user.value.name) {
    data.name = formData.value.name;
  }
  if (formData.value.description !== (user.value.description || '')) {
    data.description = formData.value.description;
  }

  if (Object.keys(data).length === 0) {
    loading.value = false;
    router.back();
    return;
  }

  await updateUser({
    id: user.value.id,
    data,
  });
};
</script>

<style scoped lang="scss">
.content-wrapper {
  padding-bottom: 100px;
}

.input-label {
  display: block;
  text-align: left;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.57;
  letter-spacing: 0.8px;
}

</style>

