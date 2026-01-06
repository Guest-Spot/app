<template>
  <div class="public-about-me-tab flex column q-gap-md full-width">
    <InfoCard
      v-if="canClaim"
    >
      <template #footer v-if="canClaim">
        <!-- Claim Button -->
        <p class="text-grey-6">
          This artist has not yet claimed their profile. Please contact Guest Spot support to claim it.
        </p>
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
      v-if="basicInformation.length || canClaim"
      title="About me"
      icon="description"
      :data="basicInformation"
    />
    <InfoCard
      v-if="workingHours?.length"
      title="Working Hours"
      icon="schedule"
      :data="workingHours"
      class="opening-times-card"
    />
    <InfoCard v-if="location.length" title="Location" icon="location_on" :data="location" />
    <InfoCard v-if="contacts.length" title="Contacts" icon="contact_phone" :data="contacts" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import InfoCard from 'src/components/InfoCard.vue';
import { InfoItemType, OpeningHoursDays } from 'src/interfaces/enums';
import type { IUser } from 'src/interfaces/user';
import useDate from 'src/modules/useDate';

interface Props {
  artistData: IUser;
  canClaim: boolean;
}

defineEmits<{
  (e: 'claim'): void;
}>();

const props = defineProps<Props>();

const { formatTime } = useDate();

const basicInformation = computed(() =>
  [
    {
      label: '',
      value: props.artistData.description || '',
    },
  ].filter((item) => item.value),
);

const location = computed(() =>
  [
    {
      label: 'City',
      value: props.artistData.city || '',
    },
    {
      label: 'Address',
      value: props.artistData.address || '',
    },
  ].filter((item) => item.value),
);

const contacts = computed(() =>
  [
    {
      label: 'Phone',
      value: props.artistData.phone || '',
      type: InfoItemType.Phone,
    },
    {
      label: 'Email',
      value: props.artistData.email || '',
      type: InfoItemType.Email,
    },
  ].filter((item) => item.value),
);

const workingHours = computed(() => {
  const times = [...(props.artistData.openingHours || [])];
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
