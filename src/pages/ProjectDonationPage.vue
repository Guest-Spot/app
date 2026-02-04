<template>
  <q-page class="page q-py-md flex column items-start q-gap-md q-pb-5xl">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="handleBack" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">
        Support <span class="text-primary">the project</span>
      </h2>
    </div>

    <div class="q-my-auto full-width">
      <div class="container">
        
        <div v-if="isLoading" class="text-center full-width bg-block border-radius-lg q-pa-lg">
          <div class="flex column q-gap-sm">
            <q-skeleton type="text" width="90%" />
            <q-skeleton type="text" width="70%" />
            <q-skeleton type="text" width="80%" />
          </div>
        </div>

        <div v-else class="full-width flex column q-gap-md">
            <div class="tip-card bg-block border-radius-lg q-pa-lg">
              <div class="tip-body">
                <div class="tip-header">
                  <div class="text-subtitle1 text-bold">Support the future of GuestSpot</div>
                  <div class="text-caption text-grey-6">
                    Your contribution helps us build better tools for artists, studios, and the tattoo community.
                  </div>
                </div>
                
                <div class="tip-options">
                    <button
                      v-for="pkg in packages"
                      :key="pkg.identifier"
                      type="button"
                      class="tip-option bg-block"
                      :class="{ 'tip-option--active': selectedPackageId === pkg.identifier }"
                      @click="handleSelectPackage(pkg)"
                    >
                      <span class="tip-option__price">{{ pkg.product.priceString }}</span>
                      <span class="tip-option__label">{{ pkg.product.title }}</span>
                    </button>
                 </div>
                 
                 <div v-if="packages.length === 0" class="text-center text-grey-7 q-py-md">
                    No donation packages available at the moment.
                 </div>
              </div>
            </div>
        </div>

      </div>
    </div>
    
    <div class="action-buttons container bg-block">
        <q-btn
          rounded
          class="grow-button q-py-sm q-mb-lg q-mt-md"
          color="primary"
          :loading="isPurchasing"
          :disable="!selectedPackageId || isPurchasing"
          @click="handlePurchase"
        >
          <div class="flex items-center justify-center q-gap-sm">
            <q-icon name="volunteer_activism" />
            <span class="text-h6">
              Support <span v-if="selectedPackagePrice"> {{ selectedPackagePrice }}</span>
            </span>
          </div>
        </q-btn>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import useProjectDonation from 'src/composables/useProjectDonation';
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor';

const router = useRouter();
const { init, packages, purchasePackage, isLoading, isPurchasing } = useProjectDonation();
const selectedPackageId = ref<string | null>(null);

const handleBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    void router.push('/');
  }
};

const handleSelectPackage = (pkg: PurchasesPackage) => {
    selectedPackageId.value = pkg.identifier;
};

const selectedPackagePrice = computed(() => {
    const pkg = packages.value.find(p => p.identifier === selectedPackageId.value);
    return pkg ? pkg.product.priceString : '';
});

const handlePurchase = async () => {
    const pkg = packages.value.find(p => p.identifier === selectedPackageId.value);
// Voiding promise to satisfy lint if needed, though await should work.
    if (pkg) {
        await purchasePackage(pkg);
        selectedPackageId.value = null; 
    }
};

onMounted(() => {
    init().catch((e) => console.error(e));
});
</script>

<style scoped>
.tip-card,
.tip-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tip-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.tip-option {
  position: relative;
  min-height: 50px;
  padding: 14px 12px 12px;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  color: var(--q-text-primary);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
}

.tip-option:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 0, 0, 0.2);
}

.tip-option__price {
  font-size: 20px;
  font-weight: 700;
}

.tip-option__label {
  font-size: 12px;
  color: var(--text-secondary);
}

.tip-option--active {
  background: var(--q-primary);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

.tip-option--active .tip-option__label {
  color: rgba(255, 255, 255, 0.8);
}

.grow-button {
  flex: 1;
  min-width: 180px;
  width: 100%;
}

.action-buttons {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
}

.body--dark .tip-option {
  border-color: rgba(255, 255, 255, 0.12);
}

.body--dark .tip-option:hover {
  border-color: rgba(255, 255, 255, 0.3);
}
</style>
