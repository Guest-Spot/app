<template>
  <q-page class="page q-py-md flex column items-center justify-center">
    <div class="container">
      <div class="flex column items-center q-gap-md text-center">
        <div class="text-primary" style="font-size: 10rem; font-weight: 700; line-height: 1">404</div>

        <div class="flex column items-center">
          <h3 class="text-h6 q-mb-sm">Page not found</h3>
          <p class="text-grey-6 text-center q-mb-xl q-px-xl">The requested page does not exist or has been moved</p>
        </div>

        <q-btn
          to="/"
          label="Go to home"
          icon="home"
          class="bg-block q-px-lg back-btn"
          rounded
          unelevated
        />
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.back-btn {
  min-height: 40px;
}
</style>
