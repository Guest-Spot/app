<template>
  <q-page class="page flex column items-start portfolio-page">
    <div class="page-card">
      <div class="dialog-header">
        <div class="header-left flex items-center q-gap-sm">
          <div class="text-subtitle1 text-bold">{{ title }}</div>
        </div>
        <q-btn
          icon="close"
          class="bg-block"
          text-color="primary"
          round
          dense
          @click="closePage"
        />
      </div>

      <div class="dialog-content">
        <div v-if="isLoading" class="loading-state">
          <q-spinner size="40px" color="primary" />
          <p>Loading portfolio work...</p>
        </div>

        <template v-else>
          <div class="input-group hidden">
            <label class="input-label">Title</label>
            <q-input
              v-model="formData.title"
              outlined
              dense
              rounded
              placeholder="Enter work title"
              class="custom-input"
            />
          </div>

          <div class="input-group">
            <label class="input-label">Description</label>
            <q-input
              v-model="formData.description"
              outlined
              dense
              rounded
              type="textarea"
              placeholder="Enter work description"
              class="custom-input"
              rows="3"
            />
          </div>

          <div class="input-group">
            <label class="input-label">Images</label>
            <ImageUploader
              :images="formData.pictures || []"
              placeholder="Upload images"
              multiple
              placeholderIcon="photo_library"
              @on-upload="imagesForUpload = $event"
              @on-remove="imagesForRemove = $event"
              @on-update="onUpdateImages"
            />
          </div>

          <StyleSelector v-model="formData.styles" />
        </template>
      </div>
    </div>

    <div class="dialog-actions bg-block full-width">
      <q-btn label="Cancel" rounded unelevated class="bg-block" @click="closePage" />
      <q-btn
        :label="isEditing ? 'Save' : 'Create'"
        rounded
        color="primary"
        unelevated
        :loading="isSubmitting"
        :disable="isSubmitting || !canCreate"
        @click="confirmWork"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLazyQuery, useMutation } from '@vue/apollo-composable';
import type { IPortfolioForm } from 'src/interfaces/portfolio';
import ImageUploader from 'src/components/ImageUploader/index.vue';
import StyleSelector from 'src/components/Portfolio/StyleSelector.vue';
import { PORTFOLIO_QUERY } from 'src/apollo/types/portfolio';
import { DELETE_IMAGE_MUTATION } from 'src/apollo/types/mutations/image';
import type { IGraphQLPortfolioResult } from 'src/interfaces/portfolio';
import useNotify from 'src/modules/useNotify';
import useUser from 'src/modules/useUser';
import usePortfolios from 'src/composables/usePortfolios';
import { uploadFiles, type UploadFileResponse } from 'src/api';

defineOptions({
  name: 'PortfolioPage',
});

const route = useRoute();
const router = useRouter();
const { showSuccess, showError } = useNotify();
const { user } = useUser();
const { createPortfolio, updatePortfolio } = usePortfolios();

const isEditing = computed(() => route.query.mode === 'edit');
const workId = computed(() => route.query.workId as string | undefined);
const canCreate = computed(() => !isEditing.value ? formData.description.length > 0 && formData.pictures?.length && formData.pictures.length > 0 && formData.styles.length > 0 : true);

const isSubmitting = ref(false);
const isLoading = ref(false);

const formData = reactive<IPortfolioForm>({
  title: '',
  description: '',
  styles: [],
  pictures: [],
});

// Image upload state
const imagesForUpload = ref<File[]>([]);
const imagesForRemove = ref<string[]>([]);

// Apollo queries and mutations
const { load: loadPortfolio, onResult: onPortfolioResult } = useLazyQuery<IGraphQLPortfolioResult>(PORTFOLIO_QUERY);
const { mutate: deleteImage } = useMutation(DELETE_IMAGE_MUTATION);

const closePage = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back();
    return;
  }
  void router.push('/profile');
};

const confirmWork = async () => {
  try {
    isSubmitting.value = true;

    const profile = user.value;
    if (!profile?.documentId) {
      showError('User profile not found');
      return;
    }

    // Delete images if any
    if (imagesForRemove.value.length > 0) {
      for (const id of imagesForRemove.value) {
        await deleteImage({ id });
      }
    }

    // Upload new images
    let uploadedFiles: UploadFileResponse[] = [];
    if (imagesForUpload.value.length > 0) {
      uploadedFiles = await uploadFiles(imagesForUpload.value);
    }

    // Prepare data for mutation
    const portfolioData = {
      owner: profile.documentId,
      title: formData.title,
      description: formData.description,
      pictures: [
        ...uploadedFiles.map((file) => file.id),
        ...(formData.pictures
          ?.map((picture) => picture.id)
          .filter((id) => !imagesForRemove.value.includes(id)) || []),
      ],
      styles: formData.styles,
    };

    if (isEditing.value && workId.value) {
      // Update existing portfolio
      const result = await updatePortfolio(workId.value, portfolioData);

      if (result) {
        showSuccess('Portfolio updated successfully');
        closePage();
      }
    } else {
      // Create new portfolio
      const result = await createPortfolio(portfolioData);

      if (result) {
        showSuccess('Portfolio created successfully');
        closePage();
      }
    }
  } catch (error) {
    console.error('Failed to save portfolio work:', error);
    showError('Failed to save portfolio work. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

const onUpdateImages = (files: { id: string; file: File }[]) => {
  imagesForRemove.value = files.map((file) => file.id);
  imagesForUpload.value = files.map((file) => file.file);
};

// Computed property for title
const title = computed(() => (isEditing.value ? 'Edit Portfolio Work' : 'Add New Work'));

// Load work data if editing
onMounted(async () => {
  if (isEditing.value && workId.value) {
    try {
      isLoading.value = true;
      await loadPortfolio(null, { documentId: workId.value }, { fetchPolicy: 'network-only' });
    } catch (error) {
      console.error('Failed to load portfolio work:', error);
      showError('Failed to load portfolio work');
    } finally {
      isLoading.value = false;
    }
  }
});

// Handle portfolio result
onPortfolioResult(({ data }) => {
  if (data?.portfolio) {
    const work = data.portfolio;
    formData.title = work.title || '';
    formData.description = work.description || '';
    formData.styles = work.styles?.map((s) => s.name) || [];
    formData.pictures = work.pictures?.map((picture, index) => ({
      index,
      url: picture.url,
      id: picture.id,
    })) || [];
  }
});
</script>

<style scoped lang="scss">
.portfolio-page {
  box-sizing: border-box;
  padding-bottom: 90px;
}

.page-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.dialog-content {
  padding: 20px;
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;

  .loading-state {
    text-align: center;
    padding: 60px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .input-group {
    margin-bottom: 20px;

    .input-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      font-size: 14px;
    }

    .custom-input {
      width: 100%;
    }
  }
}

.dialog-actions {
  padding: 16px 20px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  bottom: 0;
  z-index: 10;

  .q-btn {
    min-width: 100px;
    font-weight: 600;
  }
}

.body--dark {
  .portfolio-page {
    .dialog-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
