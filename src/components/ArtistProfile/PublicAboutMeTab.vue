<template>
  <div class="public-about-me-tab flex column q-gap-md full-width">
    <InfoCard title="Basic Information" icon="person" :data="basicInformation" />
    <InfoCard title="Contacts" icon="contact_phone" :data="contacts" />
    <InfoCard title="Social Links" icon="link" :data="socialLinks" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import InfoCard from 'src/components/InfoCard.vue';
import { InfoItemType } from 'src/interfaces/enums';

interface ArtistData {
  username: string;
  fullname: string;
  status: string;
  bio: string;
  phone: string;
  email: string;
  instagram: string;
  facebook: string;
}

interface Props {
  artistData: ArtistData;
}

const props = defineProps<Props>();

const basicInformation = computed(() => ([
  {
    label: 'Username',
    value: props.artistData.username,
  },
  {
    label: 'Fullname',
    value: props.artistData.fullname,
  },
  {
    label: 'Status',
    value: props.artistData.status,
  },
  {
    label: 'Bio',
    value: props.artistData.bio,
  },
]));

const contacts = computed(() => ([
  {
    label: 'Phone',
    value: props.artistData.phone,
  },
  {
    label: 'Email',
    value: props.artistData.email,
  },
]));

const socialLinks = computed(() => ([
  {
    label: 'Instagram',
    value: props.artistData.instagram,
    type: InfoItemType.Link,
  },
  {
    label: 'Facebook',
    value: props.artistData.facebook,
    type: InfoItemType.Link,
  },
]));
</script>
