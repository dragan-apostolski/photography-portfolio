<script setup lang="ts">
import PhotoPreview from './ui/PhotoPreview.vue'
import Button from './ui/Button.vue'

interface GalleryPhoto {
  src: string
  title: string
  description: string
  tag: string
}

interface ContentItem {
  meta?: {
    photos?: GalleryPhoto[]
  }
}

const router = useRouter()

const navigateToGallery = () => {
  router.push('/gallery')
}

// Fetch photo data from content file using useAsyncData for proper SSR handling
const { data: galleryPreviewData } = await useAsyncData('galleryPreview', async () => {
  const all = await queryCollection('content').all()

  // Find the galleryPreview file by checking different possible paths
  return (
    all.find((item) => item.path === '/galleryPreview') ||
    all.find((item) => item.path === '/gallery-preview') ||
    all.find((item) => item.title === 'Gallery Preview Photos') ||
    null
  )
})

const previewPhotos = computed<GalleryPhoto[]>(() => {
  return (galleryPreviewData.value as ContentItem)?.meta?.photos || []
})
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
