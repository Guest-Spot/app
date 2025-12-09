<template>
  <q-dialog v-model="isVisible" position="bottom" no-route-dismiss>
    <q-card class="email-confirmation-dialog">
      <q-card-section class="dialog-header">
        <div class="text-subtitle1 text-bold">Account Confirmed</div>
        <q-btn
          icon="close"
          class="bg-block"
          text-color="primary"
          round
          dense
          v-close-popup
        />
      </q-card-section>

      <q-card-section class="dialog-content">
        <p class="text-body1 q-mb-md">
          <span class="text-primary text-weight-bold">Email confirmation successful!</span> Your account has been confirmed.
        </p>
        <p class="text-grey-6 q-mb-md" v-if="email">
          If you forgot your password or don't have one, you can reset it by sending a password reset link to <span class="text-primary text-weight-bold">{{ email }}</span>.
        </p>
        <p class="text-grey-6 q-mb-md" v-else>
          If you forgot your password or don't have one, you can reset it by visiting the forgot password page.
        </p>
      </q-card-section>

      <q-card-actions class="dialog-actions bg-block">
        <q-btn
          color="grey-9"
          rounded
          unelevated
          class="bg-block"
          :to="{ path: '/forgot-password', query: email ? { email } : {} }"
          @click="isVisible = false"
        >
          <div class="q-px-md">
            <span class="text-body2">Forgot password?</span>
          </div>
        </q-btn>
        <q-btn
          color="primary"
          rounded
          unelevated
          v-close-popup
        >
          <div class="q-px-md">
            <span class="text-body2">Continue</span>
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  modelValue: boolean;
  email: string;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isVisible = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
  },
);

watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<style scoped lang="scss">
.email-confirmation-dialog {
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 10px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);

    .text-subtitle1 {
      font-weight: 600;
    }
  }

  .dialog-content {
    padding: 20px;
  }

  .dialog-actions {
    padding: 16px 20px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    bottom: 0;
    z-index: 10;

    .q-btn {
      min-width: 100px;
      font-weight: 600;
    }
  }
}

.body--dark {
  .email-confirmation-dialog {
    .dialog-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
