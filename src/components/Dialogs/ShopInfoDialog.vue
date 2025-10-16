<template>
  <q-dialog v-model="isVisible" position="bottom" maximized no-route-dismiss>
    <q-card class="shop-info-dialog">
      <q-card-section class="dialog-header">
        <div class="text-subtitle1 text-bold">Artist works at:</div>
        <q-btn
          icon="close"
          class="bg-block"
          text-color="primary"
          round
          dense
          size="sm"
          @click="closeDialog"
        />
      </q-card-section>

      <q-card-section v-if="shopData" class="dialog-content">
        <!-- Shop Info Card -->
        <div class="shop-info-card bg-block border-radius-md cursor-pointer" @click="goToShop">
          <div class="shop-info-content flex items-center q-gap-md q-pa-md">
            <!-- Shop Image -->
            <div class="shop-image-wrapper">
              <q-img
                v-if="shopData.pictures && shopData.pictures.length > 0"
                :src="shopData.pictures[0]?.url"
                :ratio="1"
                spinner-color="primary"
                spinner-size="24px"
                class="shop-image border-radius-sm"
              />
              <div
                v-else
                class="shop-image border-radius-sm bg-block flex items-center justify-center"
              >
                <q-icon name="no_photography" size="32px" color="grey-9" />
              </div>
            </div>

            <!-- Shop Details -->
            <div class="shop-details flex column q-gap-xs flex-1">
              <span class="shop-name text-subtitle2 text-bold">{{ shopData.name }}</span>
              <div v-if="shopData.city || shopData.address" class="flex items-start q-gap-xs">
                <q-icon name="location_on" size="14px" color="grey-6" class="q-mt-xs" />
                <span class="text-caption text-grey-6">
                  {{ [shopData.city, shopData.address].filter(Boolean).join(', ') }}
                </span>
              </div>
              <div class="flex items-center q-gap-xs">
                <q-icon name="schedule" size="16px" color="grey-6" />
                <span class="text-caption text-grey-6">{{ openingHourText }}</span>
              </div>
            </div>

            <!-- Arrow Icon -->
            <q-icon name="chevron_right" size="24px" color="grey-6" class="q-ml-auto" />
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="dialog-actions bg-block">
        <q-btn
          label="Visit Shop"
          rounded
          unelevated
          color="primary"
          class="full-width"
          @click="goToShop"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { IUser } from 'src/interfaces/user';
import { OpeningHoursIndexDays } from 'src/interfaces/enums';
import useDate from 'src/modules/useDate';

interface Props {
  modelValue: boolean;
  shopData: Pick<IUser, 'documentId' | 'name' | 'city' | 'address' | 'pictures' | 'openingHours'> | null;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const router = useRouter();
const { formatTime } = useDate();

const isVisible = ref(props.modelValue);

const openingHourText = computed(() => {
  const dayIndex = new Date().getDay();
  const todayKey = Object.entries(OpeningHoursIndexDays).find(
    ([, value]) => Number(value) === dayIndex,
  )?.[0] as keyof typeof OpeningHoursIndexDays | undefined;
  const todayTime = props.shopData?.openingHours?.find((time) => time.day === todayKey);
  if (todayTime?.start && todayTime?.end) {
    return `${formatTime(todayTime.start)} - ${formatTime(todayTime.start)}`;
  };
  return 'Closed';
});

const closeDialog = () => {
  isVisible.value = false;
};

const goToShop = () => {
  if (props.shopData?.documentId) {
    void router.push(`/shop/${props.shopData.documentId}`);
    closeDialog();
  }
};

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
.shop-info-dialog {
  border-radius: 20px 20px 0 0;
  max-width: 500px;
  width: 100%;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);

    .text-subtitle1 {
      font-weight: 600;
    }
  }

  .dialog-content {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  }

  .dialog-actions {
    padding: 16px 20px 32px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);

    .q-btn {
      font-weight: 600;
    }
  }
}

.shop-info-card {
  overflow: hidden;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
}

.shop-info-content {
  position: relative;
}

.shop-image-wrapper {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.shop-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shop-details {
  overflow: hidden;
}

.shop-name {
  line-height: 1.3;
}

.body--dark {
  .shop-info-dialog {
    .dialog-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .dialog-actions {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
  }
}
</style>

