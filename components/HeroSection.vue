<script setup lang="ts">
import type { Photo } from '~/types/photo'

// Manually define the photo data for now to debug the component connection
const photos = ref<Photo[]>([
  {
    title: 'Coastal serenity',
    src: '/photos/originals/landscape/Zadar.jpg',
    alt: 'Serene coastal landscape with stunning sunset colors',
    description: 'The beauty of the Adriatic Sea',
    buttonTitle: 'Explore the Adriatic Sea',
  },
  {
    title: 'Sigiriya',
    src: '/photos/originals/landscape/Sigiriya.jpg',
    alt: 'Majestic mountain peaks with dramatic clouds',
    description: 'The land of diversity',
    buttonTitle: 'Explore the diversity of Sri Lanka',
  },
  {
    title: 'Goli Vrh',
    src: '/photos/originals/landscape/GoliVrh.jpg',
    alt: 'Explore the gorgeous Slovenian mountains',
    description: 'The pristine Julian Alps of Slovenia',
    buttonTitle: 'Explore the Julian Alps',
  },
  {
    title: 'Soča',
    src: '/photos/originals/landscape/soca.jpg',
    alt: 'The turquoise waters of the Soča River',
    description: 'Turquoise wonderwater',
    buttonTitle: 'Explore the beauty of the Soča river',
  },
])

// TODO After debugging, we'll switch back to content-based approach
</script>

<template>
  <section id="hero" class="relative h-screen w-full">
    <PhotoCarousel :photos="photos" />
  </section>
</template>
