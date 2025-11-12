<script setup lang="ts">
import PhotoCarousel from './PhotoCarousel.vue'

const { getCarouselPhotos } = useCarousel()

// Fetch carousel data
const { data: photos } = await useAsyncData('carousel-photos', getCarouselPhotos)
</script>

<template>
  <section id="hero" class="relative h-screen w-full">
    <PhotoCarousel :photos="photos || []" />
  </section>
</template>
