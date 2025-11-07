<template>
  <q-page class="page q-py-md flex column items-center justify-center">
    <div class="container">
      <div class="flex column items-center q-gap-md text-center">
        <div class="expired-icon-wrapper">
          <q-icon name="schedule" color="warning" />
        </div>

        <div class="flex column items-center">
          <h3 class="text-h5 text-bold q-my-sm">Link Expired or Used</h3>
          <p class="text-warning text-center q-mb-md q-pa-md text-subtitle2 bg-block border-radius-lg">
            This onboarding link has expired or has already been used. Please try again to set up your payment account.
          </p>
          <p class="text-grey-6 text-center q-px-xl text-bold">
            You can safely close this browser window now.
          </p>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.expired-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(var(--q-warning-rgb), 0.1);

  .q-icon {
    font-size: 80px;
  }
}
</style>

