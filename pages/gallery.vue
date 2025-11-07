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

    <!-- Photo grid - Manual columns with round-robin distribution -->
    <div v-if="filteredPhotos.length > 0">
      <!-- Mobile: 1 column -->
      <div class="flex flex-col gap-4 sm:hidden">
        <div
          v-for="(photo, index) in photoColumns.mobile[0]"
          :key="photo.id"
          class="transform cursor-pointer transition duration-300 ease-in-out hover:scale-[1.01]"
          @click="openPhotoDetail(photo)"
        >
          <PhotoPreview
            :photo="{
              src: photo.src,
              title: photo.title,
              description: photo.description,
            }"
            :aspect-ratio="photo.aspectRatio || 'square'"
            cta-link="#"
            :loading="index < 3 ? 'eager' : 'lazy'"
            :fetchpriority="index < 3 ? 'high' : 'auto'"
          />
        </div>
      </div>

      <!-- Tablet: 2 columns -->
      <div class="hidden gap-4 sm:flex md:hidden">
        <div
          v-for="(column, colIndex) in photoColumns.tablet"
          :key="`tablet-col-${colIndex}`"
          class="flex flex-1 flex-col gap-4"
        >
          <div
            v-for="(photo, photoIndex) in column"
            :key="photo.id"
            class="transform cursor-pointer transition duration-300 ease-in-out hover:scale-[1.01]"
            @click="openPhotoDetail(photo)"
          >
            <PhotoPreview
              :photo="{
                src: photo.src,
                title: photo.title,
                description: photo.description,
              }"
              :aspect-ratio="photo.aspectRatio || 'square'"
              cta-link="#"
              :loading="colIndex < 2 && photoIndex === 0 ? 'eager' : 'lazy'"
              :fetchpriority="colIndex < 2 && photoIndex === 0 ? 'high' : 'auto'"
            />
          </div>
        </div>
      </div>

      <!-- Desktop: 3 columns -->
      <div class="hidden gap-4 md:flex">
        <div
          v-for="(column, colIndex) in photoColumns.desktop"
          :key="`desktop-col-${colIndex}`"
          class="flex flex-1 flex-col gap-4"
        >
          <div
            v-for="(photo, photoIndex) in column"
            :key="photo.id"
            class="transform cursor-pointer transition duration-300 ease-in-out hover:scale-[1.01]"
            @click="openPhotoDetail(photo)"
          >
            <PhotoPreview
              :photo="{
                src: photo.src,
                title: photo.title,
                description: photo.description,
              }"
              :aspect-ratio="photo.aspectRatio || 'square'"
              cta-link="#"
              :loading="colIndex < 3 && photoIndex === 0 ? 'eager' : 'lazy'"
              :fetchpriority="colIndex < 3 && photoIndex === 0 ? 'high' : 'auto'"
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
      :next-photo-src="nextPhotoSrc"
      :previous-photo-src="previousPhotoSrc"
    />
  </div>
</template>

<script setup lang="ts">
// Import UI components
import PhotoPreview from '~/components/ui/PhotoPreview.vue'
import PhotoDetail from '~/components/ui/PhotoDetail.vue'
import Tag from '~/components/ui/Tag.vue'
import type { Photo } from '~/types/photo'
import { generatePhotoId } from '~/utils/photoUtils'

interface ContentItem {
  meta?: {
    photos?: Photo[]
  }
}

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

// Get photo URL helper
const { getPhotoUrl } = useProjects()

// Fetch photo data from content file using useAsyncData for proper SSR handling
const { data: galleryData } = await useAsyncData('gallery', async () => {
  const all = await queryCollection('content').all()

  // Find the gallery file by checking different possible paths
  return (
    all.find((item) => item.path === '/gallery') ||
    all.find((item) => item.title === 'Photo Gallery Collection') ||
    { meta: { photos: [] } }
  )
})

const photos = computed<Photo[]>(() => {
  const rawPhotos = (galleryData.value as ContentItem)?.meta?.photos || []
  // Transform photo URLs to use CDN and auto-generate IDs if missing
  return rawPhotos.map((photo, index) => ({
    ...photo,
    id: photo.id || generatePhotoId(photo.src),
    src: getPhotoUrl(photo.src),
    rating: photo.rating || 3, // Default rating of 3 if not specified
    originalIndex: index // Keep track of original order
  }))
})

// State
const selectedTag = ref('')
const currentPhotoId = ref('')

// Available tags for filtering
const availableTags = computed(() => {
  const tagSet = new Set<string>()
  photos.value.forEach((photo) => {
    photo.tag.forEach((tag) => tagSet.add(tag))
  })
  return Array.from(tagSet).sort()
})

// Filter and sort photos by rating (highest first)
const filteredPhotos = computed(() => {
  const filtered = selectedTag.value
    ? photos.value.filter((photo) => photo.tag.includes(selectedTag.value))
    : photos.value
  
  return [...filtered].sort((a, b) => {
    const ratingDiff = (b.rating || 3) - (a.rating || 3)
    if (ratingDiff !== 0) return ratingDiff
    return (a.originalIndex || 0) - (b.originalIndex || 0)
  })
})

// Distribute photos into columns using round-robin for better visual hierarchy
const photoColumns = computed(() => {
  const photos = filteredPhotos.value
  
  const distributeIntoColumns = (photoList: Photo[], numColumns: number) => {
    const cols: Photo[][] = Array.from({ length: numColumns }, () => [])
    photoList.forEach((photo, index) => {
      cols[index % numColumns].push(photo)
    })
    return cols
  }
  
  return {
    mobile: distributeIntoColumns(photos, 1),
    tablet: distributeIntoColumns(photos, 2),
    desktop: distributeIntoColumns(photos, 3)
  }
})

// Tag filtering
const setSelectedTag = (tag: string) => {
  if (selectedTag.value === tag) {
    selectedTag.value = ''
    navigateTo('/gallery')
  } else {
    selectedTag.value = tag
    navigateTo(`/gallery?tag=${encodeURIComponent(tag)}`)
  }
}

// Photo detail modal handlers
const openPhotoDetail = (photo: Photo) => {
  currentPhotoId.value = photo.id
}

const closePhotoDetail = () => {
  currentPhotoId.value = ''
}

// Helper to get current photo index
const getCurrentPhotoIndex = () => {
  return filteredPhotos.value.findIndex((p) => p.id === currentPhotoId.value)
}

const goToNextPhoto = () => {
  const currentIndex = getCurrentPhotoIndex()
  if (currentIndex < filteredPhotos.value.length - 1) {
    currentPhotoId.value = filteredPhotos.value[currentIndex + 1].id
  }
}

const goToPreviousPhoto = () => {
  const currentIndex = getCurrentPhotoIndex()
  if (currentIndex > 0) {
    currentPhotoId.value = filteredPhotos.value[currentIndex - 1].id
  }
}

const currentPhoto = computed(() => {
  return filteredPhotos.value.find((photo) => photo.id === currentPhotoId.value)
})

const hasNextPhoto = computed(() => {
  const currentIndex = getCurrentPhotoIndex()
  return currentIndex < filteredPhotos.value.length - 1
})

const hasPreviousPhoto = computed(() => {
  const currentIndex = getCurrentPhotoIndex()
  return currentIndex > 0
})

const nextPhotoSrc = computed(() => {
  const currentIndex = getCurrentPhotoIndex()
  if (currentIndex < filteredPhotos.value.length - 1) {
    return filteredPhotos.value[currentIndex + 1].src
  }
  return undefined
})

const previousPhotoSrc = computed(() => {
  const currentIndex = getCurrentPhotoIndex()
  if (currentIndex > 0) {
    return filteredPhotos.value[currentIndex - 1].src
  }
  return undefined
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
