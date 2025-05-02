<script setup lang="ts">
const { data: home } = await useAsyncData(() => queryCollection('content').path('/').first())
const colorMode = useColorMode()
colorMode.preference = 'system'

useSeoMeta({
  title: home.value?.title,
  description: home.value?.description,
})
</script>

<template>
  <div class="flex h-screen w-full flex-col items-center">
    <h1 class="text-left text-7xl">Hello</h1>
    <p class="text-accent">Here you will find my best photos</p>
    <select
      v-model="colorMode.preference"
      class="h-8 w-24 border dark:border-gray-700 dark:bg-gray-900 dark:text-white"
    >
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </div>
</template>
