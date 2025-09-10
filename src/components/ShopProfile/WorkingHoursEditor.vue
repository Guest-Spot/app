<template>
  <div class="working-hours">
    <div class="days-row">
      <div
        v-for="(item, idx) in localHours"
        :key="item.day"
        class="day-card bg-block border-radius-md"
      >
        <div class="day-title text-subtitle2 text-bold bg-block q-py-sm q-px-md">{{ item.day }}</div>
        <div class="flex column q-gap-sm q-pa-md">
          <div class="field">
            <label class="input-label text-grey-6">Start</label>
            <q-input
              :model-value="localHours[idx]?.start || ''"
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
              :title="`Select start time — ${item.day}`"
              @confirm="onConfirm(idx, 'start', $event)"
            />
          </div>

          <div class="field">
            <label class="input-label text-grey-6">End</label>
            <q-input
              :model-value="localHours[idx]?.end || ''"
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
              :title="`Select end time — ${item.day}`"
              @confirm="onConfirm(idx, 'end', $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { TimePickerDialog } from 'src/components/Dialogs';
import type { IOpeningHours } from 'src/interfaces/shop';
import { OpeningHoursDays } from 'src/interfaces/enums';



interface Props {
  modelValue: IOpeningHours[] | [];
}

interface Emits {
  (e: 'update:modelValue', value: IOpeningHours[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const defaultHours: IOpeningHours[] = [
  { day: OpeningHoursDays.mon, start: '', end: '' },
  { day: OpeningHoursDays.tue, start: '', end: '' },
  { day: OpeningHoursDays.wed, start: '', end: '' },
  { day: OpeningHoursDays.thu, start: '', end: '' },
  { day: OpeningHoursDays.fri, start: '', end: '' },
  { day: OpeningHoursDays.sat, start: '', end: '' },
  { day: OpeningHoursDays.sun, start: '', end: '' }
];

// Local reactive copy to allow editing
const localHours = reactive<IOpeningHours[]>(props.modelValue?.length ? [...props.modelValue] : [...defaultHours]);

// Dialog visibility per day
const dialogs = reactive(
  localHours.map(() => ({ start: false, end: false }))
);

watch(
  () => props.modelValue,
  (val) => {
    if (val && val.length === 7) {
      for (let i = 0; i < 7; i++) {
        const localItem = localHours[i];
        const valItem = val[i];
        if (localItem && valItem) {
          localItem.start = valItem.start;
          localItem.end = valItem.end;
        }
      }
    }
  }
);

// Emit changes when localHours change
watch(
  () => localHours.map((d) => `${d.start}-${d.end}`).join('|'),
  () => emit('update:modelValue', [...localHours])
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

const onConfirm = (idx: number, type: 'start' | 'end', time: string) => {
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
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.day-card {
  flex: 0 0 auto;
  overflow: hidden;
}

.field {
  width: 100%;
}

.time-input {
  cursor: pointer;
}
</style>

