<template>
  <q-footer elevated>
    <q-toolbar>
      <q-toolbar-title class="row justify-around q-pb-lg q-pt-sm">
        <q-btn 
          flat 
          round 
          icon="bookmark" 
          aria-label="Bookmarks"
          :class="{ 'bg-white text-primary': $route.path === '/bookmarks' }"
          @click="$router.push('/bookmarks')"
        />
        <q-btn 
          flat 
          round 
          icon="search" 
          aria-label="Search"
          :class="{ 'bg-white text-primary': $route.path === '/' }"
          @click="$router.push('/')"
        />
        <q-btn 
          flat 
          round 
          icon="person" 
          aria-label="Profile"
          :class="{ 'bg-white text-primary': $route.path === '/profile' }"
          @click="$router.push('/profile')"
        />
      </q-toolbar-title>
    </q-toolbar>
  </q-footer>
</template>

<script setup lang="ts">
// Footer component with navigation icons
defineOptions({
  name: 'TheFooter'
});
</script>
