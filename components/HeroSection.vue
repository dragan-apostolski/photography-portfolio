<script setup lang="ts">
import type { Photo } from '~/types/photo'

interface ContentItem {
  meta?: {
    photos?: Photo[]
  }
}

// Fetch photo data from content file using useAsyncData for proper SSR handling
const { data: carouselData } = await useAsyncData('carousel', async () => {
  const all = await queryCollection('content').all()

  // Find the carousel file by checking different possible paths
  return (
    all.find((item) => item.path === '/carousel') ||
    all.find((item) => item.title === 'Hero Carousel Photos') ||
    null
  )
})

const photos = computed<Photo[]>(() => {
  return (carouselData.value as ContentItem)?.meta?.photos || []
})
</script>

<template>
  <section id="hero" class="relative h-screen w-full">
    <PhotoCarousel :photos="photos" />
  </section>
</template>
