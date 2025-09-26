import { defineStore } from 'pinia';
import type { INotify } from 'src/interfaces/notify';

export const useNotifiesStore = defineStore('notifies', {
  state: () => ({
    notifies: [] as INotify[],
    hasNewNotifies: false,
  }),
  getters: {
    getNotifies: (state) => state.notifies,
    getHasNewNotifies: (state) => state.hasNewNotifies,
  },
  actions: {
    setNotifies(notifies: INotify[]) {
      this.notifies = notifies;
    },
    setHasNewNotifies(hasNewNotifies: boolean) {
      this.hasNewNotifies = hasNewNotifies;
    },
  },
});
