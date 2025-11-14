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
        <div class="full-width bg-block border-radius-lg q-pa-lg">
          <div class="flex column items-start q-gap-md full-width">
            <div class="step-indicator text-subtitle2 text-grey-5 q-px-md q-py-sm border-radius-lg">
              Step {{ currentStep }} of {{ totalSteps }}
            </div>

            <div v-if="currentStep === 1" class="flex column items-start q-gap-md full-width">
              <div class="full-width">
                <h3 class="text-subtitle1 q-my-none">Choose account type</h3>
                <p class="text-body2 text-grey-5 q-mt-xs q-mb-none">
                  Select who you are signing up as to see the right fields.
                </p>
              </div>

              <div class="user-type-selector full-width">
                <q-card
                  v-for="type in userTypes"
                  :key="type.value"
                  class="user-type-option"
                  :class="{
                    'user-type-option--active': form.type === type.value,
                    'user-type-option--guest': type.value === 'guest',
                  }"
                  flat
                  bordered
                  clickable
                  @click="form.type = type.value"
                >
                  <div class="flex column q-gap-sm">
                    <div class="flex row items-center q-gap-sm">
                      <q-icon :name="type.icon" color="primary" />
                      <span class="text-subtitle1">{{ type.label }}</span>
                    </div>
                    <p class="text-body2 text-grey-5 q-mb-none">{{ type.description }}</p>
                  </div>
                </q-card>
              </div>

              <div class="button-group full-width q-mt-sm">
                <q-btn
                  round
                  flat
                  class="bg-block"
                  icon="arrow_back"
                  @click="goBack"
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

            <template v-else-if="currentStep === 2">
              <q-form
                v-if="isGuest"
                ref="guestDetailsForm"
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
                    placeholder="+# ### ###-####"
                    outlined
                    rounded
                    size="lg"
                    :mask="phoneInputMask"
                    clearable
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
                    round
                    flat
                    class="bg-block"
                    icon="arrow_back"
                    @click="goBack"
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

              <q-form
                v-else
                ref="businessDetailsForm"
                @submit.prevent="goToNextStep"
                class="flex column items-start q-gap-sm full-width"
              >
                <div class="flex column items-start q-gap-xs full-width">
                  <label class="input-label">{{ nameLabel }}</label>
                  <q-input
                    v-model="form.name"
                    type="text"
                    :placeholder="nameLabel"
                    outlined
                    rounded
                    size="lg"
                    :rules="nameRules"
                    class="full-width"
                    bg-color="transparent"
                  >
                    <template v-slot:prepend>
                      <q-icon :name="isShop ? 'store' : 'brush'" color="grey-6" />
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
                    placeholder="+# ### ###-####"
                    outlined
                    rounded
                    clearable
                    size="lg"
                    :mask="phoneInputMask"
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
                    round
                    flat
                    class="bg-block"
                    icon="arrow_back"
                    @click="goBack"
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
            </template>

            <q-form
              v-else-if="currentStep === 3"
              ref="locationForm"
              @submit.prevent="goToNextStep"
              class="flex column items-start q-gap-lg full-width"
            >
              <div class="flex column items-start q-gap-xs full-width">
                <label class="input-label">City</label>
                <q-input
                  v-model="form.city"
                  type="text"
                  placeholder="City"
                  outlined
                  rounded
                  size="lg"
                  class="full-width"
                  bg-color="transparent"
                >
                  <template v-slot:prepend>
                    <q-icon name="location_on" color="grey-6" />
                  </template>
                </q-input>
              </div>

              <div class="flex column items-start q-gap-xs full-width">
                <label class="input-label">Address</label>
                <q-input
                  v-model="form.address"
                  type="text"
                  placeholder="Address"
                  outlined
                  rounded
                  size="lg"
                  class="full-width"
                  bg-color="transparent"
                >
                  <template v-slot:prepend>
                    <q-icon name="home" color="grey-6" />
                  </template>
                </q-input>
              </div>

              <div class="button-group full-width q-mt-sm">
                <q-btn
                  round
                  flat
                  class="bg-block"
                  icon="arrow_back"
                  @click="goBack"
                />
                <q-btn
                  class="register-btn bg-block full-width"
                  rounded
                  unelevated
                  label="Continue"
                  @click="goToNextStep"
                />
              </div>
            </q-form>

            <q-form
              v-else-if="!isGuest && currentStep === 4"
              ref="profileDetailsForm"
              @submit.prevent="goToNextStep"
              class="flex column items-start q-gap-lg full-width"
            >
              <div class="flex column items-start q-gap-xs full-width">
                <label class="input-label">{{ experienceLabel }}</label>
                <q-input
                  v-model="form.experience"
                  type="number"
                  :placeholder="experienceLabel"
                  outlined
                  rounded
                  size="lg"
                  class="full-width"
                  bg-color="transparent"
                  min="0"
                >
                  <template v-slot:prepend>
                    <q-icon name="schedule" color="grey-6" />
                  </template>
                </q-input>
              </div>

              <div class="flex column items-start q-gap-xs full-width">
                <label class="input-label">Portfolio URL</label>
                <q-input
                  v-model="form.link"
                  type="url"
                  placeholder="Portfolio URL"
                  outlined
                  rounded
                  size="lg"
                  class="full-width"
                  bg-color="transparent"
                >
                  <template v-slot:prepend>
                    <q-icon name="link" color="grey-6" />
                  </template>
                </q-input>
              </div>

              <div class="flex column items-start q-gap-xs full-width">
                <label class="input-label">Tell us about yourself</label>
                <q-input
                  v-model="form.description"
                  type="textarea"
                  placeholder="Description"
                  outlined
                  rounded
                  :rows="5"
                  class="full-width"
                  bg-color="transparent"
                />
              </div>

              <div class="button-group full-width q-mt-sm">
                <q-btn
                  round
                  flat
                  class="bg-block"
                  icon="arrow_back"
                  @click="goBack"
                />
                <q-btn
                  type="submit"
                  class="register-btn bg-block full-width"
                  rounded
                  unelevated
                  label="Continue"
                />
              </div>
            </q-form>
            <q-form
              v-else
              ref="passwordForm"
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
import { getPhoneInputMask } from 'src/modules/usePhoneMask';
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
    type?: string;
    description?: string;
    city?: string;
    address?: string;
    link?: string;
    experience?: string;
  };
};

type UserType = 'guest' | 'shop' | 'artist';

type RegisterForm = {
  type: UserType;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  link: string;
  description: string;
  experience: string;
  password: string;
  confirmPassword: string;
};

const router = useRouter();
const { showSuccess, showError } = useNotify();

const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const currentStep = ref(1);
const form = ref<RegisterForm>({
  type: 'guest',
  name: '',
  email: '',
  phone: '',
  city: '',
  address: '',
  link: '',
  description: '',
  experience: '',
  password: '',
  confirmPassword: '',
});
const guestDetailsForm = ref<QForm | null>(null);
const businessDetailsForm = ref<QForm | null>(null);
const profileDetailsForm = ref<QForm | null>(null);
const locationForm = ref<QForm | null>(null);
const passwordForm = ref<QForm | null>(null);
const emailValidationTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const emailStatus = ref<'idle' | 'checking' | 'available' | 'taken' | 'error'>('idle');
const lastRequestedEmail = ref('');

const userTypes = [
  {
    label: 'Guest',
    value: 'guest',
    icon: 'person',
    description: 'Book sessions as a guest user.',
  },
  {
    label: 'Shop',
    value: 'shop',
    icon: 'storefront',
    description: 'Promote your shop and manage bookings.',
  },
  {
    label: 'Artist',
    value: 'artist',
    icon: 'brush',
    description: 'Showcase your work and accept appointments.',
  },
] satisfies Array<{ label: string; value: UserType; icon: string; description: string }>;

const isGuest = computed(() => form.value.type === 'guest');
const isShop = computed(() => form.value.type === 'shop');
const totalSteps = computed(() => (isGuest.value ? 4 : 5));
const nameLabel = computed(() => (isShop.value ? 'Business name' : 'Artist name'));
const experienceLabel = computed(() => (isShop.value ? 'Years of Founded' : 'Years of experience'));

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const nameRules = [(val: string) => !!val?.trim() || 'Name is required'];
const emailRules = [
  (val: string) => !!val || 'Email is required',
  (val: string) => isValidEmail(val) || 'Please enter a valid email address',
  () => emailStatus.value !== 'taken' || 'Email already in use',
  () => emailStatus.value !== 'error' || 'Unable to verify email right now',
];
const passwordRules = [
  (val: string) => !!val || 'Password is required',
  (val: string) => val.length >= 8 || 'Password must be at least 8 characters long',
];
const confirmPasswordRules = [
  (val: string) => !!val || 'Confirm password is required',
  (val: string) => val === form.value.password || 'Passwords must match',
];

const phoneInputMask = computed(() => getPhoneInputMask(form.value.phone));

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
    currentStep.value -= 1;
    return;
  }

  if (router.currentRoute.value.path === '/sign-up') {
    void router.push('/sign-in');
  } else {
    void router.back();
  }
};

const validateStepForm = async () => {
  if (currentStep.value === 1) {
    return !!form.value.type;
  }

  if (currentStep.value === 2) {
    if (emailStatus.value === 'checking') {
      showError('Please wait while we validate your email.');
      return false;
    }
    if (isGuest.value) {
      return guestDetailsForm.value ? guestDetailsForm.value.validate() : false;
    }
    return businessDetailsForm.value ? businessDetailsForm.value.validate() : false;
  }

  if (currentStep.value === 3) {
    return locationForm.value ? locationForm.value.validate() : true;
  }

  if (!isGuest.value && currentStep.value === 4) {
    return profileDetailsForm.value ? profileDetailsForm.value.validate() : false;
  }

  return true;
};

const goToNextStep = async () => {
  const isValid = await validateStepForm();

  if (!isValid) {
    return;
  }

  if (currentStep.value < totalSteps.value) {
    currentStep.value += 1;
  }
};

const goToPreviousStep = () => {
  goBack();
};

const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    showError('Passwords do not match');
    return;
  }

  const isValid = await passwordForm.value?.validate();

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
        type: form.value.type,
        description: form.value.description,
        city: form.value.city,
        address: form.value.address,
        link: form.value.link,
        experience: form.value.experience,
      },
    });

    if (!result?.errors?.length) {
      showSuccess('Registration successful. Please confirm your email.');
      // void router.push({
      //   path: '/confirm/email',
      //   query: { email: form.value.email },
      // });
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

watch(
  () => form.value.type,
  () => {
    currentStep.value = Math.min(currentStep.value, totalSteps.value);
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
  background-color: rgba(255, 255, 255, 0.04);
  border-radius: 24px;
}

.user-type-selector {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.user-type-option {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background-color: rgba(255, 255, 255, 0.02);
  transition: border-color 0.2s ease, background-color 0.2s ease;
  cursor: pointer;
}

.user-type-option--active {
  border-color: var(--q-primary);
  background-color: rgba(255, 255, 255, 0.04);
}

.user-type-option--guest {
  grid-column: 1 / -1;
}
</style>
