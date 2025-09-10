<template>
  <div class="public-about-shop-tab flex column q-gap-md">
    <InfoCard
      v-if="workingHours?.length"
      title="Opening Times"
      icon="schedule"
      :data="workingHours"
      :loading="loading"
      class="opening-times-card"
    />
    <InfoCard title="Contacts" icon="location_on" :data="contacts" />
    <InfoCard title="Links" icon="link" :data="links" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import InfoCard from 'src/components/InfoCard.vue';
import { InfoItemType, LinkType, OpeningTimesDays } from 'src/interfaces/enums';
import type { IShop } from 'src/interfaces/shop';
import useDate from 'src/modules/useDate';

interface Props {
  shopData: IShop;
  loading: boolean;
}

const props = defineProps<Props>();

const { formatTime } = useDate();

const contacts = computed(() => ([
  {
    label: 'City',
    value: props.shopData.location.city || '',
  },
  {
    label: 'Address',
    value: props.shopData.location.address || '',
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
]));

const workingHours = computed(() => {
  const times = [...(props.shopData.openingHours || [])];
  times.sort((a, b) => {
    const dayA = a.day as keyof typeof OpeningTimesDays;
    const dayB = b.day as keyof typeof OpeningTimesDays;
    const orderA = Object.keys(OpeningTimesDays).indexOf(dayA);
    const orderB = Object.keys(OpeningTimesDays).indexOf(dayB);
    return orderA - orderB;
  });

  return times.map(time => ({
    label: OpeningTimesDays[time.day as keyof typeof OpeningTimesDays],
    value: (time.start && time.end) ? `${formatTime(time.start)} - ${formatTime(time.end)}` : 'Closed',
    className: time.start && time.end ? '' : 'opening-times--closed',
  }));
});

const links = computed(() => ([
  {
    label: 'Instagram',
    value: props.shopData.links?.find(link => link.type === LinkType.Instagram)?.value || '',
    type: InfoItemType.Link,
  }
].filter(link => !!link.value)));
</script>


<style scoped lang="scss">
.opening-times-card {
  :deep(.info-row) {
    &::before {
      content: '';
      display: block;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: var(--q-primary);
      opacity: 0.6;
    }

    &:nth-child(6), &:nth-child(7) {
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
