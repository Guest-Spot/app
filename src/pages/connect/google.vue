<template>
  <q-page
    class="flex justify-center items-center"
  >
    <div class="container column q-pa-md full-width">
      <q-card class="bg-block full-width border-radius-md">
        <q-card-section class="flex items-center bg-primary">
          <h4 class="text-h6 text-white q-my-none">Connecting...</h4>
        </q-card-section>
        <q-card-section v-if="!error">
          <div class="flex items-center">
            <q-spinner color="primary" size="sm" class="q-mr-md" />
            <p class="q-ma-none">Processing...</p>
          </div>
        </q-card-section>
        <q-card-section v-else>
          <div class="flex items-start column q-gap-xs">
            <p>{{ error }}</p>
            <q-btn push color="primary" icon="refresh" label="Try later" rounded to="/sign-in" />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { connect } from 'src/api/auth'
import { useRoute } from 'vue-router'

const route = useRoute()

defineOptions({
  name: 'ConnectGoogle',
})

const error = ref('')
const access_token = ref(route?.query?.access_token || '')

onBeforeMount(async () => {
  const errorMessage = 'Something went wrong. Please try again later.'
  // Register new user by google mail
  if (access_token.value) {
    try {
      const url = `/api/auth/google/callback?access_token=${String(access_token.value || '')}&provider=google`
      await connect(url)
      window.location.href = window.location.origin
    } catch(e) {
      error.value = e instanceof Error ? e.message : errorMessage
    }
  } else {
    error.value = errorMessage
  }
})
</script>
