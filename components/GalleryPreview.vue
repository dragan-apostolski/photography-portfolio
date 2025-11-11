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

// Get photo URL helper
const { getPhotoUrl } = useProjects()

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
  const rawPhotos = (galleryPreviewData.value as ContentItem)?.meta?.photos || []
  // Transform photo URLs to use CDN
  return rawPhotos.map(photo => ({
    ...photo,
    title: `Explore ${photo.tag} gallery`,
    src: getPhotoUrl(photo.src)
  }))
})
</script>

<template>
  <section class="border-t border-secondary-200 py-16 transition-colors duration-300 dark:border-secondary-800">
    <div class="container mx-auto px-4">
      <h2 class="mb-8 text-center text-3xl font-semibold">Gallery Preview</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="(photo, index) in previewPhotos" :key="index">
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
