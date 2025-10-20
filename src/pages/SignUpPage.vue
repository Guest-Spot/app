<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="goBack" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">Create your <span class="text-primary">account</span></h2>
    </div>

    <div class="q-my-auto full-width">
      <div class="container">
        <div class="text-center full-width bg-block border-radius-lg q-pa-lg">
          <div class="flex column items-start q-gap-md full-width">
            <div class="step-indicator text-subtitle2 text-grey-5 q-px-md q-py-sm border-radius-lg">
              Step {{ currentStep }} of 2
            </div>

            <q-form
              v-if="currentStep === 1"
              ref="stepOneForm"
              @submit.prevent="goToNextStep"
              class="flex column items-start q-gap-sm full-width"
            >
              <div class="flex column items-start q-gap-xs full-width">
                <label class="input-label">Full name</label>
                <q-input
                  v-model="form.name"
                  type="text"
                  placeholder="Name"
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
                <label class="input-label">Email</label>
                <q-input
                  v-model="form.email"
                  type="email"
                  placeholder="Email"
                  outlined
                  rounded
                  size="lg"
                  :rules="emailRules"
                  :loading="emailStatus === 'checking'"
                  :error="emailStatus === 'taken' || emailStatus === 'error'"
                  :error-message="emailErrorMessage"
                  :hint="emailHint"
                  :persistent-hint="emailStatus === 'available'"
                  class="full-width"
                  bg-color="transparent"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" color="grey-6" />
                  </template>
                </q-input>
              </div>

              <div class="flex column items-start q-gap-xs full-width">
                <label class="input-label">Phone number</label>
                <q-input
                  v-model="form.phone"
                  type="tel"
                  placeholder="Phone number"
                  outlined
                  rounded
                  size="lg"
                  :mask="PHONE_INPUT_MASK"
                  :rules="phoneRules"
                  class="full-width"
                  bg-color="transparent"
                >
                  <template v-slot:prepend>
                    <q-icon name="call" color="grey-6" />
                  </template>
                </q-input>
              </div>

              <div class="button-group full-width q-mt-sm">
                <q-btn
                  type="submit"
                  class="register-btn bg-block full-width"
                  rounded
                  unelevated
                  label="Continue"
                  :disable="emailStatus === 'checking'"
                />
              </div>
            </q-form>

            <q-form
              v-else
              ref="stepTwoForm"
              @submit.prevent="handleRegister"
              class="flex column items-start q-gap-sm full-width"
            >
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
                  :loading="loading"
                  rounded
                  unelevated
                >
                  Sign up
                </q-btn>
              </div>
            </q-form>
          </div>
        </div>

        <div class="actions-section q-mt-lg">
          <div class="text-subtitle1 flex column items-center justify-center q-gap-sm">
            <span>Already have an account?</span>
            <q-btn
              flat
              dense
              color="primary"
              rounded
              label="Sign in"
              class="q-px-md"
              :to="{ path: '/sign-in' }"
            />
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
import { type QForm } from 'quasar';
import { REGISTER_MUTATION, USER_EMAIL_EXISTS_QUERY } from 'src/apollo/types/user';
import { PHONE_INPUT_MASK } from 'src/constants/masks';
import useNotify from 'src/modules/useNotify';
import getMutationErrorMessage from 'src/helpers/getMutationErrorMessage';

type RegisterResponse = {
  register: {
    jwt: string;
    user: {
      id: string;
      email: string;
    };
  };
};

type RegisterVariables = {
  input: {
    email: string;
    username: string;
    password: string;
    name?: string;
    phone?: string;
  };
};

const router = useRouter();
const { showSuccess, showError } = useNotify();

const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const currentStep = ref(1);
const form = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
});
const stepOneForm = ref<QForm | null>(null);
const stepTwoForm = ref<QForm | null>(null);
const emailValidationTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const emailStatus = ref<'idle' | 'checking' | 'available' | 'taken' | 'error'>('idle');
const lastRequestedEmail = ref('');

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const nameRules = [(val: string) => !!val || 'Name is required'];
const emailRules = [
  (val: string) => !!val || 'Email is required',
  (val: string) => isValidEmail(val) || 'Please enter a valid email address',
  () => emailStatus.value !== 'taken' || 'Email already in use',
  () => emailStatus.value !== 'error' || 'Unable to verify email right now',
];
const phoneRules = [(val: string) => !!val || 'Phone number is required'];
const passwordRules = [
  (val: string) => !!val || 'Password is required',
  (val: string) => val.length >= 8 || 'Password must be at least 8 characters long',
];
const confirmPasswordRules = [
  (val: string) => !!val || 'Confirm password is required',
  (val: string) => val === form.value.password || 'Passwords must match',
];

const { mutate: registerMutation } = useMutation<RegisterResponse, RegisterVariables>(
  REGISTER_MUTATION,
);
const { load: loadEmailExists } = useLazyQuery(USER_EMAIL_EXISTS_QUERY);

const emailErrorMessage = computed(() => {
  if (emailStatus.value === 'taken') {
    return 'Email already in use';
  }
  if (emailStatus.value === 'error') {
    return 'Unable to verify email right now';
  }
  return '';
});

const emailHint = computed(() => {
  if (emailStatus.value === 'checking') {
    return 'Validating email…';
  }
  if (emailStatus.value === 'available') {
    return 'Email is available';
  }
  return '';
});

const goBack = () => {
  if (currentStep.value > 1) {
    currentStep.value = 1;
    return;
  }

  if (router.currentRoute.value.path === '/sign-up') {
    void router.push('/sign-in');
  } else {
    void router.back();
  }
};

const goToNextStep = async () => {
  const isValid = await stepOneForm.value?.validate();

  if (emailStatus.value === 'checking') {
    showError('Please wait while we validate your email.');
    return;
  }

  if (isValid) {
    currentStep.value = 2;
  }
};

const goToPreviousStep = () => {
  currentStep.value = 1;
};

const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    showError('Passwords do not match');
    return;
  }

  const isValid = await stepTwoForm.value?.validate();

  if (!isValid) {
    return;
  }

  loading.value = true;

  const fallbackMessage = 'Failed to register. Please try again.';

  try {
    const result = await registerMutation({
      input: {
        email: form.value.email,
        username: form.value.email,
        password: form.value.password,
        name: form.value.name,
        phone: form.value.phone,
      },
    });

    if (!result?.errors?.length) {
      showSuccess('Registration successful. Please sign in.');
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

const checkEmailAvailability = async (email: string) => {
  emailStatus.value = 'checking';
  lastRequestedEmail.value = email;
  try {
    const response = await loadEmailExists(USER_EMAIL_EXISTS_QUERY, { email });
    emailStatus.value = response?.userEmailExists ? 'taken' : 'available';
  } catch {
    emailStatus.value = 'error';
    showError('Unable to verify email. Please try again later.');
  }
};

watch(
  () => form.value.email,
  (email) => {
    const trimmedEmail = email.trim();
    if (trimmedEmail !== email) {
      form.value.email = trimmedEmail;
    }

    emailStatus.value = 'idle';

    if (emailValidationTimer.value) {
      clearTimeout(emailValidationTimer.value);
      emailValidationTimer.value = null;
    }
    lastRequestedEmail.value = '';

    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      return;
    }

    emailValidationTimer.value = setTimeout(() => {
      void checkEmailAvailability(trimmedEmail);
    }, 500);
  },
);

onBeforeUnmount(() => {
  if (emailValidationTimer.value) {
    clearTimeout(emailValidationTimer.value);
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

.button-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
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
  background-color: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
}
</style>
