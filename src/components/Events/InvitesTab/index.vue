<template>
  <div class="invites-tab flex column q-gap-md">
    <!-- Header -->
    <div class="invites-header bg-block border-radius-lg">
      <h3 class="text-subtitle1 text-bold q-my-none">My Invitations</h3>
      <div class="flex q-gap-xs">
        <TabsComp
          size="sm"
          unelevated
          send-initial-tab
          :tabs="filterTabs"
          :activeTab="activeFilter"
          @set-active-tab="setActiveFilter"
        />
      </div>
    </div>

    <!-- Invitations List -->
    <div class="invites-list">
      <!-- Sent Invitations -->
      <div v-if="activeFilter.tab === SENT_TAB" class="invites-section">
        <NoResults
          v-if="!sentInvites.length"
          icon="send"
          title="No sent requests yet"
          description="When you send requests, they will appear here"
          no-btn
        />
        <div v-else class="invites-grid">
          <InviteCard
            v-for="invite in sentInvites"
            :key="invite.documentId"
            :invite="invite"
            @cancel="cancelInvite"
          />
        </div>
      </div>

      <!-- Received Invitations -->
      <div v-if="activeFilter.tab === RECEIVED_TAB" class="invites-section">
        <NoResults
          v-if="!receivedInvites.length"
          icon="inbox"
          title="No invitations for me yet"
          description="When you receive invitations, they will appear here"
          no-btn
        />

        <div v-else class="invites-grid">
          <InviteCard
            v-for="invite in receivedInvites"
            :key="invite.documentId"
            :invite="invite"
            @accept="acceptInvite"
            @reject="rejectInvite"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import type { IInvite } from 'src/interfaces/invite';
import InviteCard from 'src/components/Events/InvitesTab/InviteCard.vue';
import TabsComp from 'src/components/TabsComp.vue';
import type { ITab } from 'src/interfaces/tabs';
import useNotify from 'src/modules/useNotify';
import NoResults from 'src/components/NoResult.vue';
import { InviteType, InviteReaction } from 'src/interfaces/enums';

defineOptions({
  name: 'InvitesTab',
});

const $q = useQuasar();
const { showSuccess } = useNotify();

const SENT_TAB = 'sent';
const RECEIVED_TAB = 'received';

// State
const invites = ref<IInvite[]>([]);

// Computed properties
const sentInvites = computed(() => {
  return invites.value.filter((invite) => invite.reaction !== InviteReaction.Pending);
});

const receivedInvites = computed(() => {
  return invites.value.filter((invite) => invite.reaction === InviteReaction.Pending);
});

const filterTabs = computed<ITab[]>(() => [
  { label: 'Sent', tab: SENT_TAB, count: sentInvites.value.length },
  { label: 'Received', tab: RECEIVED_TAB, count: receivedInvites.value.length },
]);

// Filter tabs
const activeFilter = ref<ITab>(filterTabs.value[0]!);

// Methods
const setActiveFilter = (filter: ITab) => {
  activeFilter.value = filter;
};

const acceptInvite = (inviteDocumentId: string) => {
  const invite = invites.value.find((i) => i.documentId === inviteDocumentId);
  if (invite) {
    invite.reaction = InviteReaction.Accepted;
    invite.updatedAt = new Date().toISOString();
    showSuccess('Invite accepted')
  }
};

const rejectInvite = (inviteDocumentId: string) => {
  const invite = invites.value.find((i) => i.documentId === inviteDocumentId);
  if (invite) {
    invite.reaction = InviteReaction.Rejected;
    invite.updatedAt = new Date().toISOString();
    showSuccess('Invite rejected')
  }
};

const cancelInvite = (inviteDocumentId: string) => {
  $q.dialog({
    title: 'Cancel Invite',
    message: 'Are you sure you want to cancel this invite?',
    cancel: {
      color: 'grey-9',
      rounded: true,
      label: 'No, Keep It',
    },
    ok: {
      color: 'negative',
      rounded: true,
      label: 'Yes, Cancel',
    },
  }).onOk(() => {
    const invite = invites.value.find((i) => i.documentId === inviteDocumentId);
    if (invite) {
      invite.reaction = InviteReaction.Rejected;
      invite.updatedAt = new Date().toISOString();
      showSuccess('Invite cancelled')
    }
  });
};

// Load mock data on mount
onMounted(() => {
  // Mock data for demonstration
  invites.value = [
    {
      documentId: '1',
      title: 'Tattoo Session Request',
      description: 'I would like to visit your shop and ...',
      sender: '1',
      recipient: '2',
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z',
      type: InviteType.ArtistToShop,
      reaction: InviteReaction.Accepted,
      publishedAt: '2024-01-20T10:00:00Z',
    },
    {
      documentId: '2',
      title: 'Art Commission',
      description: 'Need artwork for shop decoration',
      sender: '1',
      recipient: '2',
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z',
      type: InviteType.ArtistToShop,
      reaction: InviteReaction.Accepted,
      publishedAt: '2024-01-20T10:00:00Z',
    },
    {
      documentId: '3',
      title: 'Master Class',
      description: 'Need a master class in tattooing',
      sender: '1',
      recipient: '2',
      createdAt: '2024-01-18T14:00:00Z',
      updatedAt: '2024-01-19T09:00:00Z',
      type: InviteType.ArtistToShop,
      reaction: InviteReaction.Rejected,
      publishedAt: '2024-01-20T10:00:00Z',
    },
    {
      documentId: '3',
      title: 'Master Class',
      description: 'Need a master class in tattooing',
      sender: '1',
      recipient: '2',
      createdAt: '2024-01-18T14:00:00Z',
      updatedAt: '2024-01-19T09:00:00Z',
      type: InviteType.ArtistToShop,
      reaction: InviteReaction.Pending,
      publishedAt: '2024-01-20T10:00:00Z',
    },
    {
      documentId: '4',
      title: 'Art Commission',
      description: 'Need artwork for shop decoration',
      sender: '1',
      recipient: '2',
      createdAt: '2024-01-18T14:00:00Z',
      updatedAt: '2024-01-19T09:00:00Z',
      type: InviteType.ArtistToShop,
      reaction: InviteReaction.Pending,
      publishedAt: '2024-01-20T10:00:00Z',
    },
  ];
});
</script>

<style scoped lang="scss">
.invites-tab {
  .invites-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 4px 4px 16px;

    .filter-tab {
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-1px);
      }
    }
  }

  .invites-section {
    .empty-state {
      text-align: center;
      padding: 40px 20px;

      .empty-text {
        margin: 16px 0 8px 0;
        font-size: 16px;
        font-weight: 600;
      }

      .empty-subtext {
        margin: 0;
        font-size: 14px;
        opacity: 0.8;
      }
    }

    .invites-grid {
      display: grid;
      gap: 16px;
    }
  }
}
</style>
