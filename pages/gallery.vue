<template>
  <div class="container mx-auto min-h-screen px-4 py-24">
    <h1 class="mb-8 text-3xl font-bold tracking-tight sm:text-4xl">Photo Gallery</h1>

    <!-- Tag filters -->
    <div class="mb-8 flex flex-wrap gap-2">
      <Tag
        v-for="tag in availableTags"
        :key="tag"
        :label="tag"
        :active="selectedTag === tag"
        @click="setSelectedTag(tag)"
      />
    </div>

    <!-- Photo grid - Masonry layout -->
    <div v-if="filteredPhotos.length > 0">
      <!-- Use CSS columns for masonry on larger screens, flexbox on mobile -->
      <div class="flex flex-col gap-4 sm:block sm:columns-2 sm:gap-4 md:columns-3">
        <div
          v-for="photo in filteredPhotos"
          :key="photo.id"
          class="mb-4 inline-block w-full break-inside-avoid"
        >
          <div
            class="w-full transform cursor-pointer transition duration-300 ease-in-out hover:scale-[1.01]"
            @click="openPhotoDetail(photo)"
          >
            <PhotoPreview
              :photo="{
                src: photo.src,
                title: photo.title,
                description: photo.description,
                tag: photo.tag?.[0] || '',
              }"
              :aspect-ratio="photo.aspectRatio || 'square'"
              cta-link="#"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="flex h-64 flex-col items-center justify-center rounded-lg bg-secondary-100 dark:bg-secondary-800"
    >
      <p class="text-lg">No photos found with the selected filter.</p>
      <button
        class="mt-4 rounded-full bg-accent px-4 py-2 text-sm font-medium text-primary transition-all hover:translate-y-[-2px]"
        @click="selectedTag = ''"
      >
        Clear filters
      </button>
    </div>

    <!-- Photo detail modal -->
    <PhotoDetail
      v-if="currentPhoto"
      :photo="currentPhoto"
      :on-close="closePhotoDetail"
      :on-next="goToNextPhoto"
      :on-previous="goToPreviousPhoto"
      :has-next="hasNextPhoto"
      :has-previous="hasPreviousPhoto"
    />
  </div>
</template>

<script setup lang="ts">
import type { Photo } from '~/composables/usePhotoGallery'
// Import UI components
import PhotoPreview from '~/components/ui/PhotoPreview.vue'
import PhotoDetail from '~/components/ui/PhotoDetail.vue'
import Tag from '~/components/ui/Tag.vue'

// Page meta
useHead({
  title: 'Gallery | Photography Portfolio',
  meta: [
    {
      name: 'description',
      content:
        'Browse my photography collection across various categories including landscape, travel, portrait and more.',
    },
  ],
})

// Get photos from the gallery composable
const { availableTags, getAllPhotos, getPhotosByTag } = usePhotoGallery()

// Track the current tag filter
const selectedTag = ref('')
// Track the currently viewed photo
const currentPhotoId = ref('')
// No need for isMobile variable - we'll handle responsiveness with Tailwind CSS

// Filter photos based on the selected tag
const filteredPhotos = computed(() => {
  if (!selectedTag.value) {
    return getAllPhotos()
  }
  return getPhotosByTag(selectedTag.value)
})

// Update the selected tag and reset the URL if needed
const setSelectedTag = (tag: string) => {
  if (selectedTag.value === tag) {
    selectedTag.value = ''
    navigateTo('/gallery')
  } else {
    selectedTag.value = tag
    navigateTo(`/gallery?tag=${encodeURIComponent(tag)}`)
  }
}

// Handle opening a photo in the detail view
const openPhotoDetail = (photo: Photo) => {
  currentPhotoId.value = photo.id
}

// Close the photo detail view
const closePhotoDetail = () => {
  currentPhotoId.value = ''
}

// Navigate to the next photo
const goToNextPhoto = () => {
  const currentIndex = filteredPhotos.value.findIndex((p) => p.id === currentPhotoId.value)
  if (currentIndex < filteredPhotos.value.length - 1) {
    currentPhotoId.value = filteredPhotos.value[currentIndex + 1].id
  }
}

// Navigate to the previous photo
const goToPreviousPhoto = () => {
  const currentIndex = filteredPhotos.value.findIndex((p) => p.id === currentPhotoId.value)
  if (currentIndex > 0) {
    currentPhotoId.value = filteredPhotos.value[currentIndex - 1].id
  }
}

// Get the current photo details
const currentPhoto = computed(() => {
  return filteredPhotos.value.find((photo) => photo.id === currentPhotoId.value)
})

// Check if we have next/previous photos
const hasNextPhoto = computed(() => {
  const currentIndex = filteredPhotos.value.findIndex((p) => p.id === currentPhotoId.value)
  return currentIndex < filteredPhotos.value.length - 1
})

const hasPreviousPhoto = computed(() => {
  const currentIndex = filteredPhotos.value.findIndex((p) => p.id === currentPhotoId.value)
  return currentIndex > 0
})

// On page load, check for tag parameter in URL
onMounted(() => {
  const route = useRoute()
  const tagParam = route.query.tag as string
  if (tagParam && availableTags.value.includes(tagParam)) {
    selectedTag.value = tagParam
  }
})
</script>
