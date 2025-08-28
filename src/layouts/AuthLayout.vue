<template>
  <q-layout view="hHh LpR fFf">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// Auth layout without header and footer
</script>

<style scoped lang="scss">
.auth-page {
  min-height: 100vh;
  padding-bottom: 32px;
}

.q-ios-padding .auth-page {
  padding-top: 70px;
}
</style>
