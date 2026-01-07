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
        <div class="text-center full-width bg-block border-radius-lg q-pa-lg">
          <q-form @submit.prevent="handleSave" class="flex column items-start q-gap-sm full-width">
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

    <!-- Sticky Save Button -->
    <div class="sticky-save-button">
      <div class="container">
        <q-btn
          class="save-btn bg-block full-width"
          :loading="loading"
          rounded
          unelevated
          @click="handleSave"
        >
          Save changes
        </q-btn>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMutation } from '@vue/apollo-composable';
import { UPDATE_USER_MUTATION } from 'src/apollo/types/user';
import useNotify from 'src/modules/useNotify';
import useUser from 'src/modules/useUser';

const router = useRouter();
const { showSuccess, showError } = useNotify();
const { fetchMe, user } = useUser();

const loading = ref(false);
const formData = ref({
  phone: '',
  email: '',
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
      };
    }
  },
  { immediate: true },
);

const { mutate: updateUser, onDone: onDoneUpdate } = useMutation(UPDATE_USER_MUTATION);

onDoneUpdate((result) => {
  loading.value = false;
  if (result.errors?.length) {
    console.error('Error updating user:', result.errors);
    showError('Error updating contacts');
    return;
  }

  if (result.data?.updateUsersPermissionsUser) {
    void fetchMe().then(() => {
      showSuccess('Contacts successfully updated');
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
  if (formData.value.phone !== (user.value.phone || '')) {
    data.phone = formData.value.phone || null;
  }
  if (formData.value.email !== (user.value.email || '')) {
    data.email = formData.value.email;
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

.sticky-save-button {
  position: sticky;
  bottom: 0;
  background: var(--q-dark-page, #fff);
  padding: 16px 0;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.save-btn {
  font-weight: 700;
  font-size: 18.8px;
  letter-spacing: 0.6px;
  height: 48px;
  text-transform: none;
}
</style>

