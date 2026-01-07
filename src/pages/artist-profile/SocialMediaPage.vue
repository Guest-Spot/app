<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="$router.back()" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">Social <span class="text-primary">Media</span></h2>
    </div>

    <div class="content-wrapper full-width q-pb-xl">
      <div class="container">
        <div class="text-center full-width bg-block border-radius-lg q-pa-lg">
          <div class="flex column items-start q-gap-sm full-width">
            <div v-if="formData.links && formData.links.length > 0" class="links-list full-width q-mb-md">
              <div
                v-for="(link, index) in formData.links"
                :key="index"
                class="links-row q-mb-md"
              >
                <div class="link-input-group">
                  <q-select
                    outlined
                    dense
                    rounded
                    v-model="link.type"
                    :options="getAvailableLinkTypes(index)"
                    option-label="label"
                    option-value="value"
                    map-options
                    emit-value
                    class="custom-input"
                  />
                  <q-input
                    outlined
                    dense
                    rounded
                    placeholder="Enter URL"
                    class="custom-input"
                    v-model="link.value"
                    clearable
                  />
                  <q-btn
                    round
                    flat
                    icon="delete"
                    color="negative"
                    size="sm"
                    class="remove-link-btn bg-block"
                    @click="removeLink(index)"
                  />
                </div>
              </div>
            </div>
            <div class="input-group full-width">
              <div v-if="allLinkTypesAdded" class="text-body2 text-grey-7 text-center q-pa-md">
                All social media link types have been added
              </div>
              <q-btn
                v-else
                rounded
                unelevated
                flat
                color="primary"
                icon="add"
                label="Add social media link"
                class="add-link-btn full-width bg-block"
                @click="addLink"
              />
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <SaveButton :has-changes="!!hasChanges" :loading="loading" @save="handleSave" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMutation } from '@vue/apollo-composable';
import { UPDATE_USER_MUTATION } from 'src/apollo/types/user';
import useNotify from 'src/modules/useNotify';
import useUser from 'src/modules/useUser';
import { LinkType } from 'src/interfaces/enums';
import SaveButton from 'src/components/SaveButton.vue';

const router = useRouter();
const { showSuccess, showError } = useNotify();
const { fetchMe, user } = useUser();

const loading = ref(false);
const formData = ref<{ links: Array<{ type: LinkType; value: string }> }>({
  links: [],
});
const originalLinks = ref<Array<{ type: LinkType; value: string }>>([]);

// Social link types options
const socialLinkTypes = [
  { label: 'Instagram', value: LinkType.Instagram },
  { label: 'Facebook', value: LinkType.Facebook },
  { label: 'Telegram', value: LinkType.Telegram },
  { label: 'WhatsApp', value: LinkType.Whatsapp },
  { label: 'TikTok', value: LinkType.Tiktok },
  { label: 'YouTube', value: LinkType.Youtube },
  { label: 'VK', value: LinkType.Vk },
];

// Load user data
watch(
  user,
  (profile) => {
    if (profile) {
      const links = profile?.profile?.links ? [...profile.profile.links] : [];
      formData.value = {
        links,
      };
      originalLinks.value = JSON.parse(JSON.stringify(links));
    }
  },
  { immediate: true },
);

// Get used link types (excluding current index to allow changing type)
const getUsedLinkTypes = (excludeIndex?: number): LinkType[] => {
  if (!formData.value.links || formData.value.links.length === 0) {
    return [];
  }
  return formData.value.links
    .map((link, index) => (index !== excludeIndex && link?.type ? link.type : null))
    .filter((type): type is LinkType => type !== null);
};

// Get available link types for a specific link (by index)
const getAvailableLinkTypes = (currentIndex: number) => {
  const usedTypes = getUsedLinkTypes(currentIndex);
  return socialLinkTypes.filter((linkType) => !usedTypes.includes(linkType.value));
};

// Check if all link types are added
const allLinkTypesAdded = computed(() => {
  if (!formData.value.links || formData.value.links.length === 0) {
    return false;
  }
  const usedTypes = getUsedLinkTypes();
  const uniqueUsedTypes = new Set(usedTypes);
  return uniqueUsedTypes.size >= socialLinkTypes.length;
});

// Get first available link type
const getFirstAvailableLinkType = (): LinkType => {
  const usedTypes = getUsedLinkTypes();
  const availableType = socialLinkTypes.find((linkType) => !usedTypes.includes(linkType.value));
  return availableType?.value || LinkType.Instagram;
};

const addLink = () => {
  if (allLinkTypesAdded.value) {
    return;
  }
  if (!formData.value.links) {
    formData.value.links = [];
  }
  formData.value.links.push({
    type: getFirstAvailableLinkType(),
    value: '',
  });
};

const removeLink = (index: number) => {
  if (formData.value.links) {
    formData.value.links.splice(index, 1);
  }
};

const { mutate: updateUser, onDone: onDoneUpdate } = useMutation(UPDATE_USER_MUTATION);

const hasChanges = computed(() => {
  return (
    JSON.stringify(formData.value.links || []) !== JSON.stringify(originalLinks.value || [])
  );
});

onDoneUpdate((result) => {
  loading.value = false;
  if (result.errors?.length) {
    console.error('Error updating user:', result.errors);
    showError('Error updating social media links');
    return;
  }

  if (result.data?.updateUsersPermissionsUser) {
    void fetchMe().then(() => {
      showSuccess('Social media links successfully updated');
      router.back();
    });
  }
});

const handleSave = async () => {
  if (!user.value?.id) {
    showError('User not found');
    return;
  }

  loading.value = true;

  const linksChanged =
    JSON.stringify(formData.value.links || []) !== JSON.stringify(originalLinks.value || []);

  if (!linksChanged) {
    loading.value = false;
    router.back();
    return;
  }

  const data = {
    profile: {
      links: (formData.value.links || []).filter((link) => link.value && link.value.trim() !== ''),
    },
  };

  await updateUser({
    id: user.value.id,
    data,
  });
};
</script>

<style scoped>
.content-wrapper {
  padding-bottom: 100px;
}

.input-label {
  display: block;
  text-align: left;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.57;
  letter-spacing: 0.8px;
}


.links-row {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.link-input-group {
  flex: 1;
  display: flex;
  gap: 10px;
  align-items: center;
}

.add-link-btn {
  margin-bottom: 8px;
}
</style>

