<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="goToProfile" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">Change <span class="text-primary">Account Type</span></h2>
    </div>

    <div class="q-my-auto full-width">
      <div class="container">
        <div class="full-width bg-block border-radius-lg q-pa-lg">
          <div class="flex column items-start q-gap-md full-width">
            <div class="step-indicator bg-block text-subtitle2 text-grey-5 q-px-md q-py-sm border-radius-lg">
              Step {{ currentStep }} of {{ totalSteps }}
            </div>

            <div v-if="currentStep === 1" class="flex column items-start q-gap-md full-width">
              <div class="full-width">
                <h3 class="text-subtitle1 q-my-none">Choose account type</h3>
                <p class="text-body2 text-grey-6 q-mt-xs q-mb-none">
                  Select the account type you want to switch to.
                </p>
              </div>

              <div class="user-type-selector full-width">
                <q-card
                  v-for="type in userTypes"
                  :key="type.value"
                  class="business-card"
                  :class="{
                    'business-card--active': form.type === type.value,
                  }"
                  flat
                  clickable
                  @click="form.type = type.value"
                >
                  <div class="flex no-wrap items-center q-gap-md">
                    <div class="business-icon">
                      <q-icon :name="type.icon" color="primary" size="md" />
                    </div>
                    <div class="flex-grow">
                      <div class="text-subtitle1 text-weight-medium">{{ type.label }}</div>
                      <div class="text-caption text-grey-5">{{ type.description }}</div>
                    </div>
                    <q-icon
                      :name="form.type === type.value ? 'radio_button_checked' : 'radio_button_unchecked'"
                      :color="form.type === type.value ? 'primary' : 'grey-6'"
                    />
                  </div>
                </q-card>
              </div>

              <div class="button-group full-width q-mt-sm">
                <q-btn
                  round
                  flat
                  class="bg-block"
                  icon="arrow_back"
                  @click="goToProfile"
                />
                <q-btn
                  class="register-btn bg-block full-width"
                  rounded
                  unelevated
                  label="Continue"
                  @click="goToNextStep"
                  :disable="!form.type"
                />
              </div>
            </div>

            <q-form
              v-else-if="currentStep === 2"
              ref="credentialsForm"
              @submit.prevent="goToNextStep"
              class="flex column items-start q-gap-sm full-width"
            >
              <div class="flex column items-start q-gap-xs full-width">
                <label class="input-label">Username</label>
                <q-input
                  v-model="form.username"
                  type="text"
                  placeholder="Choose a username"
                  outlined
                  rounded
                  size="lg"
                  :rules="usernameRules"
                  :loading="usernameStatus === 'checking'"
                  :error="usernameStatus === 'taken' || usernameStatus === 'error'"
                  :error-message="usernameErrorMessage"
                  :hint="usernameHint"
                  :persistent-hint="usernameStatus === 'available'"
                  class="full-width"
                  bg-color="transparent"
                  clearable
                >
                  <template v-slot:prepend>
                    <q-icon name="person" color="grey-6" />
                  </template>
                </q-input>
              </div>

              <div class="flex column items-start q-gap-xs full-width">
                <label class="input-label">Password</label>
                <q-input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Password"
                  outlined
                  rounded
                  size="lg"
                  :rules="passwordRules"
                  class="full-width"
                  bg-color="transparent"
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

              <div class="flex row no-wrap items-center q-gap-sm full-width q-mt-sm">
                <q-btn
                  round
                  flat
                  class="bg-block"
                  icon="arrow_back"
                  @click="goToPreviousStep"
                />
                <q-btn
                  type="submit"
                  class="register-btn bg-block full-width"
                  rounded
                  unelevated
                >
                  Continue
                </q-btn>
              </div>
            </q-form>

            <div v-else class="flex column items-start q-gap-md full-width">
              <InfoCard title="Confirm changes" icon="info" :data="confirmationItems">
                <template #footer>
                  <div class="info-row flex row no-wrap items-center address-row">
                    <span class="info-label text-grey-6">Password:</span>
                    <div class="info-value text-grey-6">
                      <span class="text-grey-6">{{ showPassword ? form.password : '********' }}</span>
                    </div>
                    <div class="flex items-center q-gap-sm q-ml-auto mt-minus-5">
                      <q-btn
                        :icon="showPassword ? 'visibility_off' : 'visibility'"
                        size="sm"
                        round
                        unelevated
                        class="bg-block"
                        text-color="primary"
                        aria-label="Remove address"
                        @click="showPassword = !showPassword"
                      />
                    </div>
                  </div>
                </template>
              </InfoCard>

              <div class="flex row no-wrap items-center q-gap-sm full-width">
                <q-btn
                  round
                  flat
                  class="bg-block"
                  icon="arrow_back"
                  @click="goToPreviousStep"
                />
                <q-btn
                  class="register-btn bg-block full-width"
                  rounded
                  unelevated
                  :loading="loading"
                  :disable="loading"
                  @click="handleUpdate"
                >
                  Confirm
                </q-btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useLazyQuery, useMutation } from '@vue/apollo-composable';
import type { QForm } from 'quasar';
import { UPDATE_USER_MUTATION, USER_USERNAME_EXISTS_QUERY } from 'src/apollo/types/user';
import useNotify from 'src/modules/useNotify';
import useUser from 'src/modules/useUser';
import getMutationErrorMessage from 'src/helpers/getMutationErrorMessage';
import { UserType } from 'src/interfaces/enums';
import { setAccountTypeUpgradeDialogPending } from 'src/composables/useAccountTypeUpgradeDialog';
import InfoCard from 'src/components/InfoCard.vue';

type AccountType = UserType.Artist | UserType.Shop;

type ChangeAccountForm = {
  type: AccountType | null;
  username: string;
  password: string;
  confirmPassword: string;
};

type UpdateResponse = {
  updateUsersPermissionsUser: {
    data: {
      documentId: string;
    };
  };
};

type UpdateVariables = {
  id: string;
  data: Record<string, unknown>;
};

const router = useRouter();
const { showSuccess, showError } = useNotify();
const { user, fetchMe } = useUser();

const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const currentStep = ref(1);
const totalSteps = 3;
const credentialsForm = ref<QForm | null>(null);
const guardGuest = ref(true);
const usernameValidationTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const usernameStatus = ref<'idle' | 'checking' | 'available' | 'taken' | 'error'>('idle');

const form = ref<ChangeAccountForm>({
  type: null,
  username: '',
  password: '',
  confirmPassword: '',
});

const userTypes = [
  {
    label: 'Become an Artist',
    summaryLabel: 'Artist',
    value: UserType.Artist,
    icon: 'brush',
    description: 'Showcase your work and accept appointments',
  },
  {
    label: 'Open a Shop',
    summaryLabel: 'Shop',
    value: UserType.Shop,
    icon: 'storefront',
    description: 'Promote your shop and manage bookings',
  },
] satisfies Array<{
  label: string;
  summaryLabel: string;
  value: AccountType;
  icon: string;
  description: string;
}>;

const selectedTypeLabel = computed(() => {
  const selected = userTypes.find((type) => type.value === form.value.type);
  return selected?.summaryLabel || 'Account';
});

const usernameTakenMessage = 'Username is already taken';

const usernameErrorMessage = computed(() => {
  if (usernameStatus.value === 'taken') {
    return usernameTakenMessage;
  }
  if (usernameStatus.value === 'error') {
    return 'Unable to verify username right now';
  }
  return '';
});

const usernameHint = computed(() => {
  if (usernameStatus.value === 'checking') {
    return 'Validating username...';
  }
  if (usernameStatus.value === 'available') {
    return 'Username is available';
  }
  return '';
});

const confirmationItems = computed(() => [
  { label: 'Account type', value: selectedTypeLabel.value },
  { label: 'Username', value: form.value.username.trim() },
]);

const usernameRules = [
  (val: string) => !!val?.trim() || 'Username is required',
  () => usernameStatus.value !== 'taken' || usernameTakenMessage,
  () => usernameStatus.value !== 'error' || 'Unable to verify username right now',
];
const passwordRules = [
  (val: string) => !!val || 'Password is required',
  (val: string) => val.length >= 8 || 'Password must be at least 8 characters long',
];
const confirmPasswordRules = [
  (val: string) => !!val || 'Confirm password is required',
  (val: string) => val === form.value.password || 'Passwords must match',
];

const { mutate: updateUser } = useMutation<UpdateResponse, UpdateVariables>(UPDATE_USER_MUTATION);
const { load: loadUsernameExists, refetch: refetchUsernameExists } = useLazyQuery(
  USER_USERNAME_EXISTS_QUERY,
  undefined,
  { fetchPolicy: 'network-only' },
);

const goToProfile = () => {
  void router.push('/profile');
};

const validateStepForm = async () => {
  if (currentStep.value === 1) {
    return !!form.value.type;
  }

  if (currentStep.value === 2) {
    if (usernameStatus.value === 'checking') {
      showError('Please wait while we validate your username.');
      return false;
    }
    if (usernameStatus.value === 'taken') {
      showError(usernameTakenMessage);
      return false;
    }
    if (usernameStatus.value === 'error') {
      showError('Unable to verify username right now');
      return false;
    }
    return credentialsForm.value ? credentialsForm.value.validate() : false;
  }

  return true;
};

const goToNextStep = async () => {
  const isValid = await validateStepForm();

  if (!isValid) {
    return;
  }

  if (currentStep.value < totalSteps) {
    currentStep.value += 1;
  }
};

const goToPreviousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value -= 1;
    return;
  }

  goToProfile();
};

const isPasswordUnsupported = (message: string) => {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes('password') &&
    (lowerMessage.includes('field') ||
      lowerMessage.includes('unknown') ||
      lowerMessage.includes('not allowed') ||
      lowerMessage.includes('not defined') ||
      lowerMessage.includes('unexpected') ||
      (lowerMessage.includes('invalid') && lowerMessage.includes('parameter')))
  );
};

const validateCredentials = () => {
  if (usernameStatus.value === 'checking') {
    showError('Please wait while we validate your username.');
    return false;
  }

  if (usernameStatus.value === 'taken') {
    showError(usernameTakenMessage);
    return false;
  }

  if (usernameStatus.value === 'error') {
    showError('Unable to verify username right now');
    return false;
  }

  if (!form.value.username.trim()) {
    showError('Username is required');
    return false;
  }

  if (!form.value.password) {
    showError('Password is required');
    return false;
  }

  if (form.value.password.length < 8) {
    showError('Password must be at least 8 characters long');
    return false;
  }

  if (!form.value.confirmPassword) {
    showError('Confirm password is required');
    return false;
  }

  if (form.value.password !== form.value.confirmPassword) {
    showError('Passwords must match');
    return false;
  }

  return true;
};

const markAccountTypeUpgradeDialog = () => {
  const userId = user.value?.id;
  const accountType = form.value.type;

  if (!userId || !accountType) {
    return;
  }

  setAccountTypeUpgradeDialogPending(userId, accountType);
};

const checkUsernameAvailability = async (username: string) => {
  usernameStatus.value = 'checking';
  try {
    const response = await loadUsernameExists(null, { username });
    if (response && response !== false) {
      usernameStatus.value = response.userUsernameExists ? 'taken' : 'available';
      return;
    }

    const refetchResponse = await refetchUsernameExists?.({ username });
    if (!refetchResponse?.data) {
      throw new Error('Username check failed');
    }
    usernameStatus.value = refetchResponse.data.userUsernameExists ? 'taken' : 'available';
  } catch {
    usernameStatus.value = 'error';
    showError('Unable to verify username. Please try again later.');
  }
};

const handleUpdate = async () => {
  if (!user.value?.id) {
    showError('User not found');
    return;
  }

  const userId = user.value.id;

  if (!form.value.type) {
    showError('Please select an account type');
    currentStep.value = 1;
    return;
  }

  if (!validateCredentials()) {
    currentStep.value = 2;
    return;
  }

  loading.value = true;

  const fallbackMessage = 'Failed to update account. Please try again.';
  const baseData = {
    type: form.value.type,
    username: form.value.username.trim(),
  };
  const dataWithPassword = {
    ...baseData,
    password: form.value.password,
  };

  const submitUpdate = async (data: Record<string, unknown>) => {
    const result = await updateUser({
      id: userId,
      data,
    });

    if (result?.errors?.length) {
      const errorMessage = result.errors.map((e: { message?: string }) => e.message || 'Unknown error').join('; ');
      throw new Error(errorMessage);
    }

    if (!result?.data?.updateUsersPermissionsUser) {
      throw new Error(fallbackMessage);
    }
  };

  try {
    await submitUpdate(dataWithPassword);
    guardGuest.value = false;
    await fetchMe();
    markAccountTypeUpgradeDialog();
    showSuccess('Account type updated successfully');
    void router.push({ path: '/profile', query: { accountTypeUpgraded: form.value.type } });
  } catch (error) {
    const message = getMutationErrorMessage(error, fallbackMessage);

    if (!isPasswordUnsupported(message)) {
      showError(message);
      loading.value = false;
      return;
    }

    try {
      await submitUpdate(baseData);
      guardGuest.value = false;
      await fetchMe();
      markAccountTypeUpgradeDialog();
      showSuccess('Account type updated. Please set your password later.');
      void router.push({ path: '/profile', query: { accountTypeUpgraded: form.value.type } });
    } catch (fallbackError) {
      showError(getMutationErrorMessage(fallbackError, fallbackMessage));
    }
  } finally {
    loading.value = false;
  }
};

watch(
  () => form.value.username,
  (value) => {
    const trimmedValue = value?.trim();
    if (trimmedValue && trimmedValue !== value?.trim()) {
      form.value.username = trimmedValue;
      return;
    }

    usernameStatus.value = 'idle';

    if (usernameValidationTimer.value) {
      clearTimeout(usernameValidationTimer.value);
      usernameValidationTimer.value = null;
    }

    if (!trimmedValue) {
      return;
    }

    if (trimmedValue === user.value?.username) {
      usernameStatus.value = 'available';
      return;
    }

    usernameValidationTimer.value = setTimeout(() => {
      void checkUsernameAvailability(trimmedValue);
    }, 500);
  },
);

watch(
  user,
  (profile) => {
    if (!profile) {
      return;
    }

    if (!guardGuest.value) {
      return;
    }

    if (profile.type !== UserType.Guest) {
      showError('Only guest accounts can change account type.');
      void router.push('/profile');
      return;
    }

    if (!form.value.username) {
      form.value.username = profile.username || '';
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (usernameValidationTimer.value) {
    clearTimeout(usernameValidationTimer.value);
  }
});
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

.address-row {
  gap: 12px;
}

.info-label {
  font-weight: 600;
  min-width: 90px;
  flex-shrink: 0;
  display: block;
}

.button-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.register-btn {
  font-weight: 700;
  font-size: 18.8px;
  letter-spacing: 0.6px;
  height: 32px;
  text-transform: none;
}

.step-indicator {
  width: 100%;
  text-align: left;
  border-radius: 24px;
}

.user-type-selector {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.business-card {
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
}

.business-card--active {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--q-primary);
}

.business-icon {
  min-width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(var(--red-accent-rgb), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
