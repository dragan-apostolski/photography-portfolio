<script setup lang="ts">
import PhotoPreview from './ui/PhotoPreview.vue'
import Button from './ui/Button.vue'

const router = useRouter()

const navigateToGallery = () => {
  router.push('/gallery')
}

const previewPhotos = [
  {
    src: '/photos/landscape/Prisojnik.avif',
    title: 'Mountain Majesty',
    description: 'Dramatic mountain peaks of Prisojnik in the Julian Alps',
    tag: 'landscape',
  },
  {
    src: '/photos/travel/BlueMosque.avif',
    title: 'Blue Mosque',
    description: 'Iconic Islamic architecture in Istanbul',
    tag: 'travel',
  },
  {
    src: '/photos/portraits/Eka.avif',
    title: 'Natural Light Portrait',
    description: 'Portrait session capturing genuine expressions',
    tag: 'portrait',
  },
  {
    src: '/photos/landscape/Sigiriya.avif',
    title: 'Ancient Fortress',
    description: 'The majestic Sigiriya rock formation in Sri Lanka',
    tag: 'landscape',
  },
  {
    src: '/photos/travel/HimalayaGirl.avif',
    title: 'Himalayan Life',
    description: 'Authentic moments from the Himalayan mountains',
    tag: 'travel',
  },
  {
    src: '/photos/portraits/Lina.avif',
    title: 'Expressive Portrait',
    description: 'Capturing personality and emotion through portraiture',
    tag: 'portrait',
  },
]
</script>

<template>
  <section class="py-16">
    <div class="container mx-auto px-4">
      <h2 class="mb-8 text-center text-3xl font-semibold">Gallery Preview</h2>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="(photo, index) in previewPhotos" :key="index" class="mb-6">
          <PhotoPreview
            :photo="photo"
            aspect-ratio="square"
            cta-text="View Gallery"
            cta-link="/gallery"
          />
        </div>
      </div>
      <div class="mt-10 text-center">
        <Button @click="navigateToGallery">View All Photos</Button>
      </div>
    </div>
  </section>
</template>
