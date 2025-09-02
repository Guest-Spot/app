<template>
  <div class="public-about-shop-tab flex column q-gap-md">
    <InfoCard title="Working Hours" icon="schedule" :data="workingHours" />
    <InfoCard title="Contacts" icon="location_on" :data="contacts" />
    <InfoCard title="Additional Info" icon="add_circle" :data="additionalInfo" />
    <InfoCard title="Links" icon="link" :data="links" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import InfoCard from 'src/components/InfoCard.vue';
import { InfoItemType } from 'src/interfaces/enums';
import type { IShop } from 'src/interfaces/shop';

interface WorkingHours {
  start: string;
  end: string;
}

interface Props {
  shopData: IShop;
  workingHours: WorkingHours;
}

const props = defineProps<Props>();

const contacts = computed(() => ([
  {
    label: 'Location',
    value: props.shopData.location || '',
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

const workingHours = computed(() => ([
  {
    label: 'Start',
    value: props.workingHours.start || '',
  },
  {
    label: 'End',
    value: props.workingHours.end || '',
  },
]));

const additionalInfo = computed(() => ([
  {
    label: 'Date Opened',
    value: props.shopData.dateOpened || '',
  },
]));

const links = computed(() => ([
  {
    label: 'Instagram',
    value: props.shopData.instagram || '',
    type: InfoItemType.Link,
  },
  {
    label: 'Facebook',
    value: props.shopData.facebook || '',
    type: InfoItemType.Link,
  },
].filter(link => !!link.value)));
</script>
