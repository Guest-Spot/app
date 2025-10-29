<template>
  <q-page class="page q-py-md flex column items-center justify-center">
    <div class="container">
      <div class="flex column items-center q-gap-md text-center">
        <div class="success-icon-wrapper">
          <q-icon name="check_circle" color="positive" />
        </div>

        <div class="flex column items-center">
          <h3 class="text-h5 text-bold q-mb-sm">Payment Successful</h3>
          <p class="text-grey-6 text-center q-mb-xl q-px-xl">
            Your deposit has been paid successfully. Your booking request has been created and the
            artist will be notified.
          </p>
        </div>

        <q-btn
          to="/my-bookings"
          label="View My Bookings"
          icon="event"
          color="primary"
          class="q-px-lg action-btn"
          rounded
          unelevated
        />
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.success-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(var(--q-positive-rgb), 0.1);

  .q-icon {
    font-size: 80px;
  }
}

.action-btn {
  min-height: 44px;
}
</style>

