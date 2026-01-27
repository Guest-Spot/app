import { defineStore } from 'pinia';
import type { IGuestSpotSlot, IGuestSpotBooking } from 'src/interfaces/guestSpot';

export const useGuestSpotStore = defineStore('guestSpot', {
  state: () => ({
    slots: [] as IGuestSpotSlot[],
    bookings: [] as IGuestSpotBooking[],
    totalSlots: 0,
    totalBookings: 0,
    pageSlots: 1,
    pageBookings: 1,
    hasMoreSlots: true,
    hasMoreBookings: true,
  }),
  getters: {
    getSlots: (state) => state.slots,
    getBookings: (state) => state.bookings,
    getTotalSlots: (state) => state.totalSlots,
    getTotalBookings: (state) => state.totalBookings,
    getPageSlots: (state) => state.pageSlots,
    getPageBookings: (state) => state.pageBookings,
    getHasMoreSlots: (state) => state.hasMoreSlots,
    getHasMoreBookings: (state) => state.hasMoreBookings,
  },
  actions: {
    setSlots(slots: IGuestSpotSlot[]) {
      this.slots = slots;
    },
    addSlots(slots: IGuestSpotSlot[]) {
      this.slots.push(...slots);
    },
    setBookings(bookings: IGuestSpotBooking[]) {
      this.bookings = bookings;
    },
    addBookings(bookings: IGuestSpotBooking[]) {
      this.bookings.push(...bookings);
    },
    setTotalSlots(total: number) {
      this.totalSlots = total;
    },
    setTotalBookings(total: number) {
      this.totalBookings = total;
    },
    setPageSlots(page: number) {
      this.pageSlots = page;
    },
    setPageBookings(page: number) {
      this.pageBookings = page;
    },
    setHasMoreSlots(hasMore: boolean) {
      this.hasMoreSlots = hasMore;
    },
    setHasMoreBookings(hasMore: boolean) {
      this.hasMoreBookings = hasMore;
    },
    clearSlots() {
      this.slots = [];
      this.totalSlots = 0;
      this.pageSlots = 1;
      this.hasMoreSlots = true;
    },
    clearBookings() {
      this.bookings = [];
      this.totalBookings = 0;
      this.pageBookings = 1;
      this.hasMoreBookings = true;
    },
    updateSlot(slot: IGuestSpotSlot) {
      const index = this.slots.findIndex((s) => s.documentId === slot.documentId);
      if (index !== -1) {
        this.slots[index] = slot;
      }
    },
    removeSlot(documentId: string) {
      this.slots = this.slots.filter((s) => s.documentId !== documentId);
    },
    updateBooking(booking: IGuestSpotBooking) {
      const index = this.bookings.findIndex((b) => b.documentId === booking.documentId);
      if (index !== -1) {
        this.bookings[index] = booking;
      }
    },
  },
});
