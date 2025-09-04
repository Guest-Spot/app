<template>
  <div class="public-about-shop-tab flex column q-gap-md">
    <InfoCard title="Contacts" icon="location_on" :data="contacts" />
    <InfoCard v-if="workingHours?.length" title="Opening Times" icon="schedule" :data="workingHours" :loading="loading" />
    <InfoCard title="Additional Info" icon="add_circle" :data="additionalInfo" />
    <InfoCard title="Links" icon="link" :data="links" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import InfoCard from 'src/components/InfoCard.vue';
import { InfoItemType, OpeningTimesDays } from 'src/interfaces/enums';
import type { IShop } from 'src/interfaces/shop';
import useDate from 'src/modules/useDate';

interface Props {
  shopData: IShop;
  loading: boolean;
}

const props = defineProps<Props>();

const { formatTime, formatDate } = useDate();

const contacts = computed(() => ([
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
]));

const workingHours = computed(() => props.shopData.openingTimes?.map(hour => ({
  label: OpeningTimesDays[hour.day as keyof typeof OpeningTimesDays],
  value: `${formatTime(hour.start)} - ${formatTime(hour.end)}`,
})));

const additionalInfo = computed(() => ([
  {
    label: 'Date Opened',
    value: formatDate(props.shopData.dateOpened || '') || '',
  },
]));

const links = computed(() => ([
  {
    label: 'Instagram',
    value: props.shopData.instagram || '',
    type: InfoItemType.Link,
  }
].filter(link => !!link.value)));
</script>
