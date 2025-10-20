import { defineStore } from 'pinia';
import type { INotify } from 'src/interfaces/notify';

export const useNotifiesStore = defineStore('notifies', {
  state: () => ({
    notifies: [] as INotify[],
    hasNewNotifies: 0,
  }),
  getters: {
    getNotifies: (state) => state.notifies,
    getHasNewNotifies: (state) => state.hasNewNotifies,
  },
  actions: {
    setNotifies(notifies: INotify[]) {
      this.notifies = notifies;
    },
    setHasNewNotifies(hasNewNotifies: number) {
      this.hasNewNotifies = hasNewNotifies;
    },
  },
});
