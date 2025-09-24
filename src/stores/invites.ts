import { defineStore } from 'pinia';
import type { IInvite } from 'src/interfaces/invite';

export const useInvitesStore = defineStore('invites', {
  state: () => ({
    invites: [] as IInvite[],
  }),
  getters: {
    getInvites: (state) => state.invites,
  },
  actions: {
    setInvites(invites: IInvite[]) {
      this.invites = invites;
    },
  },
});
