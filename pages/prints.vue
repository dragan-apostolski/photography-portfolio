<script setup lang="ts">
useSeoMeta({
  title: 'Prints | Photography Portfolio',
  description: 'Purchase physical or digital prints of my photography works.',
})

// UnderConstruction component placeholder message
const message = ref('This page is currently under construction. Coming soon!')
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="mb-8 text-4xl font-bold">Prints</h1>

    <!-- Under Construction Section -->
    <div class="flex min-h-[50vh] flex-col items-center justify-center">
      <div class="mb-8 text-8xl">
        <Icon name="ph:hard-hat" />
      </div>
      <h2 class="mb-4 text-center text-2xl font-semibold">Under Construction</h2>
      <p class="max-w-md text-center text-lg">{{ message }}</p>
    </div>
  </div>
</template>
