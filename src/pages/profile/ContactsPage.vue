<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="$router.back()" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">Contacts</h2>
    </div>

    <div class="content-wrapper full-width q-pb-xl">
      <div class="container">
        <div class="text-center full-width bg-block border-radius-lg q-px-lg q-pt-lg q-pb-sm">
          <q-form @submit.prevent="handleSave" class="flex column items-start q-gap-md full-width">
            <div class="flex column items-start q-gap-xs full-width">
              <label class="input-label">Website</label>
              <q-input
                v-model="formData.website"
                type="url"
                placeholder="Enter website URL"
                outlined
                rounded
                size="lg"
                class="full-width"
                bg-color="transparent"
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="language" color="grey-6" />
                </template>
              </q-input>
            </div>

            <div class="flex column items-start q-gap-xs full-width">
              <label class="input-label">Phone</label>
              <q-input
                v-model="formData.phone"
                type="tel"
                placeholder="Enter phone number"
                outlined
                rounded
                size="lg"
                class="full-width"
                bg-color="transparent"
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="phone" color="grey-6" />
                </template>
              </q-input>
            </div>

            <div class="flex column items-start q-gap-xs full-width">
              <label class="input-label">Email</label>
              <q-input
                v-model="formData.email"
                type="email"
                placeholder="Enter email address"
                outlined
                rounded
                size="lg"
                :rules="emailRules"
                class="full-width"
                bg-color="transparent"
              >
                <template v-slot:prepend>
                  <q-icon name="email" color="grey-6" />
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
import { UPDATE_PROFILE_MUTATION } from 'src/apollo/types/profile';
import useNotify from 'src/modules/useNotify';
import useUser from 'src/modules/useUser';
import SaveButton from 'src/components/SaveButton.vue';

const router = useRouter();
const { showSuccess, showError } = useNotify();
const { fetchMe, user } = useUser();

const loading = ref(false);
const formData = ref({
  phone: '',
  email: '',
  website: '',
});

const emailRules = [
  (val: string) => !!val || 'Email is required',
  (val: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val) || 'Please enter a valid email';
  },
];

// Load user data
watch(
  user,
  (profile) => {
    if (profile) {
      formData.value = {
        phone: profile.phone || '',
        email: profile.email || '',
        website: profile.profile?.website || '',
      };
    }
  },
  { immediate: true },
);

const { mutate: updateUser } = useMutation(UPDATE_USER_MUTATION);
const { mutate: updateProfile } = useMutation(UPDATE_PROFILE_MUTATION);

const hasChanges = computed(() => {
  return (
    formData.value.phone !== (user.value?.phone || '') ||
    formData.value.email !== (user.value?.email || '') ||
    formData.value.website !== (user.value?.profile?.website || '')
  );
});

const handleSave = async () => {
  if (!user.value?.id) {
    showError('User not found');
    return;
  }

  loading.value = true;

  const data: Record<string, unknown> = {};
  if (formData.value.phone !== (user.value.phone || '')) {
    data.phone = formData.value.phone || null;
  }
  if (formData.value.email !== (user.value.email || '')) {
    data.email = formData.value.email;
  }

  const websiteChanged = formData.value.website !== (user.value.profile?.website || '');
  const profileDocumentId = user.value.profile?.documentId;
  if (websiteChanged && !profileDocumentId) {
    loading.value = false;
    showError('Profile not found');
    return;
  }

  const mutations: Promise<unknown>[] = [];
  if (Object.keys(data).length > 0) {
    mutations.push(
      updateUser({
        id: user.value.id,
        data,
      }),
    );
  }

  if (websiteChanged && profileDocumentId) {
    mutations.push(
      updateProfile({
        documentId: profileDocumentId,
        data: {
          website: formData.value.website || null,
        },
      }),
    );
  }

  if (mutations.length === 0) {
    loading.value = false;
    router.back();
    return;
  }

  try {
    const results = await Promise.all(mutations);
    const hasErrors = results.some((result) => {
      if (typeof result !== 'object' || result === null) {
        return false;
      }
      const errors = (result as { errors?: unknown[] }).errors;
      return Array.isArray(errors) && errors.length > 0;
    });

    await fetchMe();

    if (hasErrors) {
      showError('Error updating contacts');
      return;
    }

    showSuccess('Contacts successfully updated');
    router.back();
  } catch (error) {
    console.error('Error updating contacts:', error);
    showError('Error updating contacts');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
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
