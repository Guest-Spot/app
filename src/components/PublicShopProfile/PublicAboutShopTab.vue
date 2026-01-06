<template>
  <div class="public-about-shop-tab flex column q-gap-md">
    <InfoCard
      v-if="canClaim"
      :data="[{ label: '', value: 'This shop has not yet claimed their profile. Please contact Guest Spot support to claim it.' }]"
    >
      <template #footer>
        <q-btn
          rounded
          color="primary"
          @click="$emit('claim')"
          class="full-width bg-block q-px-md"
          dense
          flat
          unelevated
        >
          <div class="flex items-center justify-center q-gap-sm">
            <q-icon name="verified" size="18px" />
            <span class="text-weight-bold">Claim</span>
          </div>
        </q-btn>
      </template>
    </InfoCard>
    <InfoCard
      v-if="workingHours?.length"
      title="Opening Times"
      icon="schedule"
      :data="workingHours"
      :loading="loading"
      class="opening-times-card"
    />
    <InfoCard v-if="links.length" title="Links" icon="link" :data="links" />
    <InfoCard v-if="contacts.length" title="Contacts" icon="location_on" :data="contacts" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import InfoCard from 'src/components/InfoCard.vue';
import { InfoItemType, OpeningHoursDays } from 'src/interfaces/enums';
import type { IUser } from 'src/interfaces/user';
import useDate from 'src/modules/useDate';

interface Props {
  shopData: IUser;
  loading: boolean;
  canClaim: boolean;
}

defineEmits<{
  (e: 'claim'): void;
}>();

const props = defineProps<Props>();

const { formatTime } = useDate();

const contacts = computed(() =>
  [
    {
      label: 'City',
      value: props.shopData.city || '',
    },
    {
      label: 'Address',
      value: props.shopData.address || '',
    },
    {
      label: 'Phone',
      value: props.shopData.phone || '',
      type: InfoItemType.Phone,
    },
    {
      label: 'Email',
      value: props.shopData.email || '',
      type: InfoItemType.Email,
    },
  ].filter((contact) => !!contact.value),
);

const links = computed(() => [
  {
    label: 'Portfolio',
    value: props.shopData.link || '',
    type: InfoItemType.Link,
  },
].filter((link) => !!link.value));

const workingHours = computed(() => {
  const times = [...(props.shopData.openingHours || [])];
  times.sort((a, b) => {
    const dayA = a.day;
    const dayB = b.day;
    const orderA = Object.keys(OpeningHoursDays).indexOf(dayA);
    const orderB = Object.keys(OpeningHoursDays).indexOf(dayB);
    return orderA - orderB;
  });

  return times.map((time) => ({
    label: OpeningHoursDays[time.day],
    value:
      time.start && time.end ? `${formatTime(time.start)} - ${formatTime(time.end)}` : 'Closed',
    className: time.start && time.end ? '' : 'opening-times--closed',
  }));
});
</script>

<style scoped lang="scss">
.opening-times-card {
  :deep(.info-row) {
    align-items: center;

    &::before {
      content: '';
      display: block;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: var(--q-primary);
      opacity: 0.6;
    }

    &:nth-child(6),
    &:nth-child(7) {
      .info-label {
        opacity: 0.6;
      }
    }
  }

  :deep(.opening-times--closed) {
    &::before {
      background-color: var(--text-secondary);
    }
  }
}
</style>
