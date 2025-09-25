import { defineStore } from 'pinia';
import type { IInvite } from 'src/interfaces/invite';

export const useInvitesStore = defineStore('invites', {
  state: () => ({
    invites: [] as IInvite[],
    hasNewInvites: false,
  }),
  getters: {
    getInvites: (state) => state.invites,
    getHasNewInvites: (state) => state.hasNewInvites,
  },
  actions: {
    setInvites(invites: IInvite[]) {
      this.invites = invites;
    },
    setHasNewInvites(hasNewInvites: boolean) {
      this.hasNewInvites = hasNewInvites;
    },
  },
});
