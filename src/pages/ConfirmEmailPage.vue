<template>
  <q-page class="page q-py-sm flex column items-center justify-center">
    <div class="container">
      <div class="email-card bg-block border-radius-lg flex column items-center q-gap-md text-center q-pa-xl">
        <div class="icon-wrapper">
          <q-icon name="email" size="48px" color="primary" />
        </div>
        <div class="flex column items-center q-gap-sm">
          <h3 class="text-h5 text-bold q-mb-none">Confirm your email</h3>
          <p class="text-subtitle2 q-px-md q-mt-sm text-grey-6">
            We sent you an email with a link to confirm your email address
            <span class="email text-primary">{{ displayEmail }}</span>.
          </p>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const normalizeValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
};

const email = computed(() => normalizeValue(route.query.email));

const displayEmail = computed(() => email.value || 'specified email address');
</script>

<style scoped lang="scss">
.email-card {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
}

.icon-wrapper {
  border-radius: 50%;
  border: 1px solid rgba(var(--q-dark34-rgb), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.email {
  font-weight: 600;
}
</style>
