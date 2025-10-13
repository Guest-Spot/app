<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="$router.back()" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">Change your <span class="text-primary">password</span></h2>
    </div>

    <div class="q-my-auto full-width">
      <div class="container">
        <div class="text-center full-width bg-block border-radius-lg q-pa-lg">
          <q-form @submit="handleChangePassword" class="flex column items-start q-gap-sm full-width">
            <div class="flex column items-start q-gap-xs full-width">
              <label class="input-label">Current password</label>
              <q-input
                v-model="form.currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                placeholder="Current password"
                outlined
                rounded
                size="lg"
                :rules="currentPasswordRules"
                class="full-width"
                bg-color="transparent"
                tabindex="1"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" color="grey-6" />
                </template>
                <template v-slot:append>
                  <q-btn
                    round
                    flat
                    dense
                    :icon="showCurrentPassword ? 'visibility_off' : 'visibility'"
                    @click="showCurrentPassword = !showCurrentPassword"
                    color="grey-6"
                  />
                </template>
              </q-input>
            </div>
            <div class="flex column items-start q-gap-xs full-width">
              <label class="input-label">New password</label>
              <q-input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="New password"
                outlined
                rounded
                size="lg"
                :rules="passwordRules"
                class="full-width"
                bg-color="transparent"
                tabindex="2"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" color="grey-6" />
                </template>
                <template v-slot:append>
                  <q-btn
                    round
                    flat
                    dense
                    :icon="showPassword ? 'visibility_off' : 'visibility'"
                    @click="showPassword = !showPassword"
                    color="grey-6"
                  />
                </template>
              </q-input>
            </div>

            <div class="flex column items-start q-gap-xs full-width">
              <label class="input-label">Confirm password</label>
              <q-input
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Confirm password"
                outlined
                rounded
                size="lg"
                :rules="confirmPasswordRules"
                class="full-width"
                bg-color="transparent"
                tabindex="3"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" color="grey-6" />
                </template>
                <template v-slot:append>
                  <q-btn
                    round
                    flat
                    dense
                    :icon="showConfirmPassword ? 'visibility_off' : 'visibility'"
                    @click="showConfirmPassword = !showConfirmPassword"
                    color="grey-6"
                  />
                </template>
              </q-input>
            </div>

            <div class="button-group full-width q-mt-sm">
              <q-btn
                type="submit"
                class="change-btn bg-block full-width"
                :loading="loading"
                rounded
                unelevated
                tabindex="4"
              >
                Change password
              </q-btn>
            </div>
          </q-form>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMutation } from '@vue/apollo-composable';
import { CHANGE_PASSWORD_MUTATION } from 'src/apollo/types/user';
import useNotify from 'src/modules/useNotify';
import useUser from 'src/modules/useUser';
import getMutationErrorMessage from 'src/helpers/getMutationErrorMessage';

type ChangePasswordResponse = {
  changePassword: {
    jwt: string;
  };
};

const router = useRouter();
const { showSuccess, showError } = useNotify();
const { logout } = useUser();

const loading = ref(false);
const showCurrentPassword = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const form = ref({
  currentPassword: '',
  password: '',
  confirmPassword: '',
});

const currentPasswordRules = [(val: string) => !!val || 'Current password is required'];

const passwordRules = [
  (val: string) => !!val || 'Password is required',
  (val: string) => val.length >= 8 || 'Password must be at least 8 characters long',
];

const confirmPasswordRules = [
  (val: string) => !!val || 'Confirm password is required',
  (val: string) => val === form.value.password || 'Passwords must match',
];

const { mutate: changePasswordMutation } = useMutation<
  ChangePasswordResponse,
  {
    currentPassword: string;
    password: string;
    passwordConfirmation: string;
  }
>(CHANGE_PASSWORD_MUTATION);

const handleChangePassword = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    showError('Passwords do not match');
    return;
  }

  loading.value = true;


  const fallbackMessage = 'Failed to change password. Please try again.';

  try {
    const result = await changePasswordMutation({
      currentPassword: form.value.currentPassword,
      password: form.value.password,
      passwordConfirmation: form.value.confirmPassword,
    });

    if (!result?.errors?.length) {
      await logout();
      showSuccess('Password successfully changed');
      form.value.password = '';
      form.value.confirmPassword = '';
      form.value.currentPassword = '';
      void router.push('/sign-in');
    } else {
      showError(getMutationErrorMessage(result.errors, fallbackMessage));
    }
  } catch (error) {
    showError(getMutationErrorMessage(error, fallbackMessage));
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.input-label {
  display: block;
  text-align: left;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.57;
  letter-spacing: 0.8px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.change-btn {
  font-weight: 700;
  font-size: 18.8px;
  letter-spacing: 0.6px;
  height: 32px;
  text-transform: none;
}
</style>
