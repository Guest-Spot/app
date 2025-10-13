<template>
  <div class="public-about-me-tab flex column q-gap-md full-width">
    <InfoCard
      v-if="basicInformation.length"
      title="Basic Information"
      icon="person"
      :data="basicInformation"
    />
    <InfoCard v-if="location.length" title="Location" icon="location_on" :data="location" />
    <InfoCard v-if="contacts.length" title="Contacts" icon="contact_phone" :data="contacts" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import InfoCard from 'src/components/InfoCard.vue';
import { InfoItemType } from 'src/interfaces/enums';
import type { IUser } from 'src/interfaces/user';

interface Props {
  artistData: IUser;
}

const props = defineProps<Props>();

const basicInformation = computed(() =>
  [
    {
      label: 'name',
      value: props.artistData.name || '',
    },
    {
      label: 'Bio',
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
</script>
