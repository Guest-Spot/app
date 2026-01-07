<template>
  <div class="working-hours">
    <div class="days-row">
      <InfoCard
        v-for="(item, idx) in localHours"
        :key="item.day"
        :title="OpeningHoursDays[item.day]"
        icon="schedule"
        class="day-card"
      >
        <template #header>
          <div class="flex column q-gap-sm">
            <div class="field">
              <label class="input-label text-grey-6">Start</label>
              <q-input
                :model-value="formatTime(localHours[idx]?.start || '')"
                outlined
                dense
                rounded
                readonly
                clearable
                class="custom-input time-input"
                @click="openDialog(idx, 'start')"
              >
                <template #append>
                  <q-icon name="schedule" class="cursor-pointer" @click="openDialog(idx, 'start')" />
                </template>
              </q-input>
              <TimePickerDialog
                :model-value="dialogs[idx]?.start || false"
                @update:model-value="(val) => updateDialogVisibility(idx, 'start', val)"
                :time="item.start"
                :title="`Select start time — ${OpeningHoursDays[item.day]}`"
                @confirm="onConfirm(idx, 'start', $event)"
              />
            </div>

            <div class="field">
              <label class="input-label text-grey-6">End</label>
              <q-input
                :model-value="formatTime(localHours[idx]?.end || '')"
                outlined
                dense
                rounded
                readonly
                clearable
                class="custom-input time-input"
                @click="openDialog(idx, 'end')"
              >
                <template #append>
                  <q-icon name="schedule" class="cursor-pointer" @click="openDialog(idx, 'end')" />
                </template>
              </q-input>
              <TimePickerDialog
                :model-value="dialogs[idx]?.end || false"
                @update:model-value="(val) => updateDialogVisibility(idx, 'end', val)"
                :time="item.end"
                :title="`Select end time — ${OpeningHoursDays[item.day]}`"
                @confirm="onConfirm(idx, 'end', $event)"
              />
            </div>
          </div>
        </template>
      </InfoCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { TimePickerDialog } from 'src/components/Dialogs';
import { InfoCard } from 'src/components';
import type { IOpeningHours } from 'src/interfaces/common';
import { OpeningHoursKeysDays, OpeningHoursDays } from 'src/interfaces/enums';
import useDate from 'src/modules/useDate';

interface Props {
  modelValue: IOpeningHours[] | [];
}

interface Emits {
  (e: 'update:modelValue', value: IOpeningHours[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { formatTime } = useDate();

const defaultHours: IOpeningHours[] = [
  { day: OpeningHoursKeysDays.mon, start: null, end: null },
  { day: OpeningHoursKeysDays.tue, start: null, end: null },
  { day: OpeningHoursKeysDays.wed, start: null, end: null },
  { day: OpeningHoursKeysDays.thu, start: null, end: null },
  { day: OpeningHoursKeysDays.fri, start: null, end: null },
  { day: OpeningHoursKeysDays.sat, start: null, end: null },
  { day: OpeningHoursKeysDays.sun, start: null, end: null },
];

// Local reactive copy to allow editing
const localHours = reactive<IOpeningHours[]>(defaultHours);

// Dialog visibility per day
const dialogs = reactive(localHours.map(() => ({ start: false, end: false })));

watch(
  () => props.modelValue,
  (val) => {
    for (const item of val || []) {
      const localItem = localHours.find((d) => d.day === item.day);
      if (localItem) {
        localItem.documentId = item.documentId || '';
        localItem.start = item.start;
        localItem.end = item.end;
      }
    }
  },
  { immediate: true },
);

// Emit changes when localHours change
watch(
  () => localHours.map((d) => `${d.start}-${d.end}`).join('|'),
  () => emit('update:modelValue', [...localHours]),
);

const openDialog = (idx: number, type: 'start' | 'end') => {
  const dialog = dialogs[idx];
  if (dialog) {
    dialog[type] = true;
  }
};

const updateDialogVisibility = (idx: number, type: 'start' | 'end', val: boolean) => {
  const dialog = dialogs[idx];
  if (dialog) {
    dialog[type] = val;
  }
};

const onConfirm = (idx: number, type: 'start' | 'end', time: string | null) => {
  const hour = localHours[idx];
  if (hour) {
    hour[type] = time;
  }
};

// For potential parent reads as computed
const value = computed(() => [...localHours]);
defineExpose({ value });
</script>

<style scoped lang="scss">
.working-hours {
  width: 100%;
}

.days-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 4px;
}

.day-card {
  width: 100%;
}

.field {
  width: 100%;
}

.time-input {
  cursor: pointer;
}
</style>
