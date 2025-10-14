<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="$router.back()" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">
        Share your <span class="text-primary">feedback</span>
      </h2>
    </div>

    <div class="q-my-auto full-width">
      <div class="container">
        <div class="text-center full-width bg-block border-radius-lg q-pa-lg">
          <q-form
            ref="formRef"
            @submit="handleSubmit"
            class="flex column items-start q-gap-sm full-width"
          >
            <div class="flex column items-start q-gap-xs full-width">
              <label class="input-label">Subject</label>
              <q-input
                v-model="form.subject"
                type="text"
                placeholder="Subject"
                outlined
                rounded
                size="lg"
                :rules="subjectRules"
                class="full-width"
                bg-color="transparent"
              >
                <template v-slot:prepend>
                  <q-icon name="subject" color="grey-6" />
                </template>
              </q-input>
            </div>

            <div class="flex column items-start q-gap-xs full-width">
              <label class="input-label">Message</label>
              <q-input
                v-model="form.message"
                type="textarea"
                placeholder="Share your thoughts"
                outlined
                rounded
                size="lg"
                :rules="messageRules"
                class="full-width"
                bg-color="transparent"
                autogrow
                counter
                maxlength="1000"
              >
                <template v-slot:prepend>
                  <q-icon name="chat" color="grey-6" />
                </template>
              </q-input>
            </div>

            <div class="button-group full-width q-mt-sm">
              <q-btn
                type="submit"
                class="submit-btn bg-block full-width"
                :loading="loading"
                rounded
                unelevated
              >
                Submit feedback
              </q-btn>
            </div>
          </q-form>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { QForm } from 'quasar';
import { useMutation } from '@vue/apollo-composable';
import { CREATE_FEEDBACK_MUTATION } from 'src/apollo/types/mutations/feedback';
import useNotify from 'src/modules/useNotify';
import getMutationErrorMessage from 'src/helpers/getMutationErrorMessage';
import { useUserStore } from 'src/stores/user';
import { useRouter } from 'vue-router';

const { showSuccess, showError } = useNotify();
const userStore = useUserStore();
const router = useRouter();

type CreateFeedbackVariables = {
  data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  };
};

type CreateFeedbackResponse = {
  createFeedback: {
    documentId: string;
  };
};

const formRef = ref<QForm | null>(null);

const form = ref({
  subject: '',
  message: '',
});

const requiredRule = (field: string) => (val: string) =>
  val?.trim().length > 0 || `${field} is required`;

const messageRules = [requiredRule('Message')];
const subjectRules = [requiredRule('Subject')];

const { mutate: createFeedbackMutation, loading } = useMutation<
  CreateFeedbackResponse,
  CreateFeedbackVariables
>(CREATE_FEEDBACK_MUTATION);

const handleSubmit = async () => {
  const fallbackMessage = 'Failed to send feedback. Please try again.';

  try {
    const result = await createFeedbackMutation({
      data: {
        name: userStore.getUser?.name || '',
        email: userStore.getUser?.email || '',
        subject: form.value.subject.trim(),
        message: form.value.message.trim(),
      },
    });

    if (result?.errors?.length) {
      showError(getMutationErrorMessage(result.errors, fallbackMessage));
      return;
    }

    if (!result?.data?.createFeedback?.documentId) {
      showError(fallbackMessage);
      return;
    }

    form.value.subject = '';
    form.value.message = '';
    setTimeout(() => {
      formRef.value?.resetValidation();
      void router.back();
    }, 0);
    showSuccess('Feedback submitted successfully');
  } catch (error) {
    showError(getMutationErrorMessage(error, fallbackMessage));
  }
};
</script>

<style scoped>
.input-label {
  display: block;
  text-align: left;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.57;
  letter-spacing: 0.8px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.submit-btn {
  font-weight: 700;
  font-size: 18.8px;
  letter-spacing: 0.6px;
  height: 32px;
  text-transform: none;
}
</style>
