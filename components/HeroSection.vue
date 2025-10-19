<script setup lang="ts">
const { getCarouselPhotos } = useCarousel()
const config = useRuntimeConfig()

// Fetch carousel data (latest projects)
const { data: photos } = await useAsyncData('carousel-photos', () => 
  getCarouselPhotos(config.public.cdnBaseUrl)
)
</script>

<template>
  <section id="hero" class="relative h-screen w-full">
    <PhotoCarousel :photos="photos || []" />
  </section>
</template>
