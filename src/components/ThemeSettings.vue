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
            :class="{ active: selectedAccentColor === color.value }"
            :style="{ backgroundColor: color.value }"
            @click="selectAccentColor(color.value)"
          >
            <q-icon
              v-if="selectedAccentColor === color.value"
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
import { ref, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import type { ITab } from 'src/interfaces/tabs';
import TabsComp from 'src/components/TabsComp.vue';

const $q = useQuasar();

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

const isDark = ref(false);
const activeThemeTab = ref<ITab>(themeTabs[0]!)

// Accent color state
const RED_COLOR = '#FF3D00'
const BLUE_COLOR = '#1976D2';
const GREEN_COLOR = '#4CAF50';
const PURPLE_COLOR = '#9C27B0'
const ORANGE_COLOR = '#FF9800'
const TEAL_COLOR = '#009688'
const PINK_COLOR = '#E91E63'
const INDIGO_COLOR = '#3F51B5'

const selectedAccentColor = ref(RED_COLOR);

// Predefined accent colors
const accentColors = [
  { name: 'Red', value: RED_COLOR },
  { name: 'Blue', value: BLUE_COLOR },
  { name: 'Green', value: GREEN_COLOR },
  { name: 'Purple', value: PURPLE_COLOR },
  { name: 'Orange', value: ORANGE_COLOR },
  { name: 'Teal', value: TEAL_COLOR },
  { name: 'Pink', value: PINK_COLOR },
  { name: 'Indigo', value: INDIGO_COLOR },
];

// LocalStorage keys
const THEME_KEY = 'guestspot-theme';
const ACCENT_COLOR_KEY = 'guestspot-accent-color';

// Save theme settings to localStorage
const saveThemeSettings = () => {
  localStorage.setItem(THEME_KEY, isDark.value ? DARK_TAB : LIGHT_TAB);
  localStorage.setItem(ACCENT_COLOR_KEY, selectedAccentColor.value);
};

// Watch for changes to save to localStorage
watch([isDark, selectedAccentColor], () => {
  saveThemeSettings();
});

// Toggle between light and dark theme
const setActiveTab = (t: ITab) => {
  activeThemeTab.value = t;
  if (t.tab === LIGHT_TAB) {
    $q.dark.set(false);
    isDark.value = false;
  } else {
    $q.dark.set(true);
    isDark.value = true;
  }
  // Theme change will be saved via watcher
};

// Select predefined accent color
const selectAccentColor = (color: string) => {
  const root = document.documentElement;
  root.style.setProperty('--q-primary', color);
  selectedAccentColor.value = color;
};

// Load theme settings from localStorage
const loadThemeSettings = () => {
  // Load theme preference
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    isDark.value = savedTheme === DARK_TAB;
    $q.dark.set(isDark.value);
    activeThemeTab.value = themeTabs[isDark.value ? 1 : 0]!;
  }

  // Load accent color
  const savedAccentColor = localStorage.getItem(ACCENT_COLOR_KEY);
  if (savedAccentColor) {
    selectAccentColor(savedAccentColor);
  }
};

// Expose data for parent component
defineExpose({
  isDark,
  selectedAccentColor
});

// Initialize theme from localStorage or Quasar defaults
onMounted(() => {
  loadThemeSettings();
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
