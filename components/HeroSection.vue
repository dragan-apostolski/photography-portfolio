<script setup lang="ts">
const { getCarouselPhotos, getCarouselMode } = useCarousel()

// Fetch carousel data based on the configured mode
const { data: photos } = await useAsyncData('carousel-photos', () => getCarouselPhotos())

// Get the current carousel mode
const carouselMode = getCarouselMode()
</script>

<template>
  <section id="hero" class="relative h-screen w-full">
    <PhotoCarousel :photos="photos || []" :mode="carouselMode" />
  </section>
</template>
