<template>
  <q-page class="page q-py-md flex column items-center justify-center">
    <div class="container">
      <div class="confirm-card bg-block border-radius-lg flex column items-center q-gap-md text-center q-pa-xl">
        <div class="status-icon-wrapper" :class="status">
          <q-spinner v-if="status === 'pending'" color="primary" size="60" />
          <q-icon
            v-else-if="status === 'success'"
            name="check_circle"
            color="positive"
            size="64px"
          />
          <q-icon
            v-else
            name="cancel"
            color="negative"
            size="64px"
          />
        </div>

        <div class="flex column items-center q-gap-sm">
          <h3 class="text-h5 text-bold q-mb-none">{{ heading }}</h3>
          <p class="text-subtitle2 q-px-md q-mt-sm">{{ description }}</p>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { api } from 'src/boot/axios';
import type { AxiosError } from 'axios';

type ConfirmationStatus = 'pending' | 'success' | 'error' | 'missing';

const route = useRoute();
const status = ref<ConfirmationStatus>('pending');
const errorMessage = ref('');

const extractQueryString = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
};

const suggestionKeys = ['token', 'confirmationToken', 'code'] as const;

const token = computed(() => {
  for (const key of suggestionKeys) {
    const value = route.query[key];
    const parsed = extractQueryString(value);
    if (parsed) {
      return parsed;
    }
  }
  return '';
});

const heading = computed(() => {
  switch (status.value) {
    case 'success':
      return 'Email confirmed';
    case 'error':
      return 'Failed to confirm email';
    case 'missing':
      return 'Confirmation token not found';
    default:
      return 'Email confirmation';
  }
});

const description = computed(() => {
  switch (status.value) {
    case 'success':
      return 'Your email address has been successfully confirmed. You can now safely continue working with the service.';
    case 'error':
      return 'An error occurred. Please try requesting a new email or contact support.';
    case 'missing':
      return 'The confirmation link appears to be incomplete. Please use the email again.';
    default:
      return 'An email with confirmation has already been sent to your address. Once you follow the link, we will automatically process the result.';
  }
});

const confirmEmail = async () => {
  const confirmationToken = token.value;

  if (!confirmationToken) {
    status.value = 'missing';
    return;
  }

  try {
    await api.post('/api/auth/confirm-email', {
      token: confirmationToken,
    });
    status.value = 'success';
  } catch (error: unknown) {
    console.error('Email confirmation failed', error);
    status.value = 'error';
    errorMessage.value =
      (error as AxiosError<{ message: string }>)?.response?.data?.message ||
      (error as Error)?.message ||
      'Check the link from the email or request a new one.';
  }
};

onMounted(() => {
  void confirmEmail();
});
</script>

<style scoped lang="scss">
.confirm-card {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
}

.status-icon-wrapper {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--q-dark71-rgb), 0.12);
}

.status-icon-wrapper.success {
  background: rgba(var(--q-positive-rgb), 0.12);
}

.status-icon-wrapper.error,
.status-icon-wrapper.missing {
  background: rgba(var(--q-negative-rgb), 0.12);
}

.confirm-action-btn {
  min-width: 220px;
}
</style>
