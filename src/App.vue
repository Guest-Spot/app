<template>
  <router-view />
</template>

<script setup lang="ts">
import { ME } from 'src/apollo/user'
import { useQuery } from '@vue/apollo-composable'

const { error, loading, result } = useQuery(ME)
console.log(error, loading, result)
</script>
