<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="$router.back()" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">Additional <span class="text-primary">Information</span></h2>
    </div>

    <div class="content-wrapper full-width q-pb-xl">
      <div class="container">
        <div class="text-center full-width bg-block border-radius-lg q-pa-lg">
          <q-form @submit.prevent="handleSave" class="flex column items-start q-gap-md full-width">
            <div class="flex column items-start q-gap-xs full-width">
              <label class="input-label">{{ isShop ? 'Year started' : 'Experience' }}</label>
              <q-input
                v-if="isShop"
                v-model="experienceStartYear"
                placeholder="Select start year"
                outlined
                rounded
                size="lg"
                class="full-width"
                bg-color="transparent"
                clearable
                readonly
                :rules="yearRules"
                @click.stop="yearProxy?.show()"
              >
                <template #prepend>
                  <q-icon name="event" color="grey-6" />
                </template>
                <template #append>
                  <q-icon name="event" class="cursor-pointer" @click.stop="yearProxy?.show()" />
                </template>
                <q-popup-proxy ref="yearProxy" cover transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="experienceStartYear"
                    mask="YYYY"
                    class="bg-block"
                    default-view="Years"
                    emit-immediately
                    :default-year-month="defaultYearMonth"
                    :navigation-max-year-month="maxYearMonth"
                  />
                </q-popup-proxy>
              </q-input>
              <q-input
                v-else
                v-model.number="experienceYears"
                type="number"
                placeholder="Enter experience"
                outlined
                rounded
                size="lg"
                :min="1"
                suffix="years"
                class="full-width"
                bg-color="transparent"
                clearable
                :rules="[
                  (val) =>
                    val === null ||
                    val === undefined ||
                    val >= 1 ||
                    'Experience must be at least 1 year',
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="work" color="grey-6" />
                </template>
              </q-input>
            </div>

          </q-form>
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
import useExperience from 'src/modules/useExperience';
import SaveButton from 'src/components/SaveButton.vue';

const router = useRouter();
const { showSuccess, showError } = useNotify();
const { fetchMe, user, isShop, isArtist } = useUser();
const { getCurrentYear, getExperienceYears, getExperienceStartYear, getStartYearFromYears } =
  useExperience();

const loading = ref(false);
const experienceYears = ref<number | null>(null);
const experienceStartYear = ref<string | null>(null);
const yearProxy = ref();
const currentYear = computed(() => getCurrentYear());
const defaultYearMonth = computed(() => `${currentYear.value}/01`);
const maxYearMonth = computed(() => `${currentYear.value}/12`);

const parseYear = (value: string | null): number | null => {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const yearRules = [
  (val: string | null) => {
    if (!val) return true;
    const parsed = parseYear(val);
    if (!parsed) return 'Select a valid year';
    return parsed <= currentYear.value || 'Year cannot be in the future';
  },
];

// Load user data
watch(
  [user, isShop, isArtist],
  ([profile]) => {
    if (!profile) {
      experienceYears.value = null;
      experienceStartYear.value = null;
      return;
    }

    if (isShop.value) {
      const startYear = getExperienceStartYear(profile.experience, currentYear.value);
      experienceStartYear.value = startYear ? String(startYear) : null;
      experienceYears.value = null;
      return;
    }

    if (isArtist.value) {
      const years = getExperienceYears(profile.experience, currentYear.value);
      experienceYears.value = years;
      experienceStartYear.value = null;
      return;
    }

    experienceYears.value = null;
    experienceStartYear.value = null;
  },
  { immediate: true },
);

const { mutate: updateUser, onDone: onDoneUpdate } = useMutation(UPDATE_USER_MUTATION);

const hasChanges = computed(() => {
  const storedStartYear = getExperienceStartYear(user.value?.experience, currentYear.value);
  const selectedStartYear = isShop.value
    ? parseYear(experienceStartYear.value)
    : isArtist.value
      ? getStartYearFromYears(experienceYears.value, currentYear.value)
      : null;
  return selectedStartYear !== storedStartYear;
});

onDoneUpdate((result) => {
  loading.value = false;
  if (result.errors?.length) {
    console.error('Error updating user:', result.errors);
    showError('Error updating information');
    return;
  }

  if (result.data?.updateUsersPermissionsUser) {
    void fetchMe().then(() => {
      showSuccess('Information successfully updated');
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

  const data: Record<string, unknown> = {};
  const storedStartYear = getExperienceStartYear(user.value.experience, currentYear.value);
  const selectedStartYear = isShop.value
    ? parseYear(experienceStartYear.value)
    : isArtist.value
      ? getStartYearFromYears(experienceYears.value, currentYear.value)
      : null;

  if (selectedStartYear !== storedStartYear) {
    data.experience = selectedStartYear;
  }

  if (Object.keys(data).length === 0) {
    loading.value = false;
    router.back();
    return;
  }

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

</style>
