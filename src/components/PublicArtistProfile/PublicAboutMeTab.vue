<template>
  <div class="public-about-me-tab flex column q-gap-md full-width">
    <InfoCard title="Basic Information" icon="person" :data="basicInformation" />
    <InfoCard title="Contacts" icon="contact_phone" :data="contacts" />
    <InfoCard v-if="links.length" title="Links" icon="link" :data="links" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import InfoCard from 'src/components/InfoCard.vue';
import { InfoItemType, LinkType } from 'src/interfaces/enums';
import type { IArtist } from 'src/interfaces/artist';

interface Props {
  artistData: IArtist;
}

const props = defineProps<Props>();

const basicInformation = computed(() => ([
  {
    label: 'name',
    value: props.artistData.name || '',
  },
  {
    label: 'Bio',
    value: props.artistData.description || '',
  },
]));

const contacts = computed(() => ([
  {
    label: 'City',
    value: props.artistData.location?.city || '',
  },
  {
    label: 'Address',
    value: props.artistData.location?.address || '',
  },
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
]));

const links = computed(() => ([
  {
    label: 'Instagram',
    value: props.artistData.links?.find(link => link.type === LinkType.Instagram)?.value || '',
    type: InfoItemType.Link,
  },
]));
</script>
