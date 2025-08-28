<template>
  <q-expansion-item
    icon="palette"
    label="Theme Settings"
    header-class="expansion-header"
    class="bg-block border-radius-lg"
  >
    <div class="info-section">
      <!-- Theme Toggle -->
      <div class="input-group">
        <label class="input-label">Theme</label>
        <TabsComp
          :tabs="themeTabs"
          :activeTab="activeThemeTab"
          @set-active-tab="setActiveTab"
          class="q-mb-lg full-width"
        />
      </div>

      <!-- Accent Color Picker -->
      <div class="input-group">
        <label class="input-label">Accent Color</label>
        <div class="color-picker">
          <div
            v-for="color in accentColors"
            :key="color.name"
            class="color-option"
            :class="{ active: accentColor === color.value }"
            :style="{ backgroundColor: color.value }"
            @click="setAccentColor(color.value)"
          >
            <q-icon
              v-if="accentColor === color.value"
              name="check"
              color="white"
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  </q-expansion-item>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { ITab } from 'src/interfaces/tabs';
import TabsComp from 'src/components/TabsComp.vue';
import * as COLORS from 'src/config/colors';
import useTheme from 'src/modules/useTheme';

// Theme state
const LIGHT_TAB = 'light';
const DARK_TAB = 'dark';

const themeTabs: ITab[] = [
  {
    label: 'Light',
    tab: LIGHT_TAB
  },
  {
    label: 'Dark',
    tab: DARK_TAB
  }
]

const activeThemeTab = ref<ITab>(themeTabs[0]!)

// Predefined accent colors
const accentColors = [
  { name: 'Red', value: COLORS.RED_COLOR },
  { name: 'Blue', value: COLORS.BLUE_COLOR },
  { name: 'Green', value: COLORS.GREEN_COLOR },
  { name: 'Purple', value: COLORS.PURPLE_COLOR },
  { name: 'Orange', value: COLORS.ORANGE_COLOR },
  { name: 'Teal', value: COLORS.TEAL_COLOR },
  { name: 'Pink', value: COLORS.PINK_COLOR },
  { name: 'Indigo', value: COLORS.INDIGO_COLOR },
];

const { setAccentColor, setDarkTheme, accentColor, isDark } = useTheme();

const setActiveTab = (t: ITab) => {
  activeThemeTab.value = t;
  if (t.tab === LIGHT_TAB) {
    setDarkTheme(false);
  } else {
    setDarkTheme(true);
  }
};

onMounted(() => {
  if (isDark.value) {
    activeThemeTab.value = themeTabs.find(t => t.tab === DARK_TAB)!;
  }
});
</script>

<style scoped lang="scss">
.info-section {
  padding: 16px;
}

.input-group {
  width: 100%;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.input-label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 14px;
}

.theme-toggle {
  display: flex;
  gap: 10px;
}

.color-picker {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: scale(1.1);
    border-color: var(--q-primary);
  }

  &.active {
    border-color: var(--q-primary);
    transform: scale(1.1);
  }
}

.custom-color-input {
  position: relative;
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.custom-input {
  width: 100%;
}
</style>
