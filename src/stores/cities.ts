import { defineStore } from "pinia";

export const useCitiesStore = defineStore('cities', {
  state: () => ({
    cities: [] as string[],
  }),
  getters: {
    getCities: (state) => state.cities,
  },
  actions: {
    setCities(cities: string[]) {
      this.cities = cities;
    },
  },
});
