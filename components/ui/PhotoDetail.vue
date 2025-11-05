<script setup lang="ts">
interface CameraSettings {
  shutterSpeed?: string
  aperture?: string
  iso?: string
}

interface Photo {
  id: string
  src: string
  title?: string
  description?: string
  location?: string
  timestamp?: string
  cameraSettings?: CameraSettings
  width?: number
  height?: number
  tag?: string | string[]
  aspectRatio?: string
}

interface PhotoDetailProps {
  photo: Photo
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
  nextPhotoSrc?: string
  previousPhotoSrc?: string
}

const props = withDefaults(defineProps<PhotoDetailProps>(), {
  onNext: undefined,
  onPrevious: undefined,
  hasNext: false,
  hasPrevious: false,
  nextPhotoSrc: undefined,
  previousPhotoSrc: undefined,
})

const isNavigationVisible = ref(false)
const photoWrapper = ref<HTMLElement | null>(null)
const isImageLoaded = ref(false)
const isTransitioning = ref(false)
const showLoadingState = ref(false)
let loadingTimeout: ReturnType<typeof setTimeout> | null = null

// Reset loading state when photo changes with transition
watch(() => props.photo.id, () => {
  isTransitioning.value = true
  isImageLoaded.value = false
  
  // Only show loading spinner if image takes longer than 100ms to load
  // This prevents flash of loading state for cached images
  if (loadingTimeout) clearTimeout(loadingTimeout)
  loadingTimeout = setTimeout(() => {
    if (!isImageLoaded.value) {
      showLoadingState.value = true
    }
  }, 100)
  
  // Reset transition after a brief delay
  setTimeout(() => {
    isTransitioning.value = false
  }, 50)
})

// Handle image load
const handleImageLoad = () => {
  if (loadingTimeout) clearTimeout(loadingTimeout)
  showLoadingState.value = false
  isImageLoaded.value = true
}


// Handle key presses for navigation and closing
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  // Prevent body scrolling while modal is open
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  // Restore body scrolling
  document.body.style.overflow = ''
})

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    props.onClose()
  } else if (event.key === 'ArrowRight' && props.onNext && props.hasNext) {
    props.onNext()
  } else if (event.key === 'ArrowLeft' && props.onPrevious && props.hasPrevious) {
    props.onPrevious()
  }
}

const handleMouseEnter = () => {
  isNavigationVisible.value = true
}

const handleMouseLeave = () => {
  isNavigationVisible.value = false
}

// Click outside to close
const handleWrapperClick = (event: MouseEvent) => {
  if (event.target === photoWrapper.value) {
    props.onClose()
  }
}

// Format camera settings for display
const formattedCameraSettings = computed(() => {
  if (!props.photo.cameraSettings) return null

  const settings = []
  const cs = props.photo.cameraSettings

  if (cs.aperture) settings.push(`f/${cs.aperture}`)
  if (cs.shutterSpeed) settings.push(`${cs.shutterSpeed}s`)
  if (cs.iso) settings.push(`ISO ${cs.iso}`)

  return settings.join(' • ')
})
</script>

<template>
  <div
    ref="photoWrapper"
    class="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-2xl transition-all duration-500 ease-out dark:bg-black/80"
    @click="handleWrapperClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Enhanced backdrop overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/60 dark:from-black/60 dark:via-black/40 dark:to-black/60" />

    <!-- Close button -->
    <button
      class="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-accent/50 focus:ring-2 focus:ring-accent/50 focus:outline-none md:top-6 md:right-6 md:h-12 md:w-12 border-black/20 bg-black/10 text-black hover:bg-black/20 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 cursor-pointer"
      @click="onClose"
    >
      <Icon name="ph:x-bold" class="h-4 w-4 md:h-5 md:w-5" />
    </button>

    <!-- Main modal container -->
    <div
      class="relative z-10 mx-2 max-h-[98vh] max-w-[98vw] md:mx-4 md:max-h-[95vh] md:max-w-[85vw] lg:max-w-[80vw]"
    >
      <!-- Image container with enhanced styling -->
      <div
        class="relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-md border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5"
      >
        <!-- Image wrapper -->
        <div class="relative w-full">
          <!-- Loading state with blur placeholder -->
          <div
            v-if="showLoadingState"
            class="absolute inset-0 flex items-center justify-center"
            :style="{ minHeight: '40vh' }"
          >
            <!-- Blurred placeholder -->
            <div class="absolute inset-0 overflow-hidden rounded-t-2xl">
              <NuxtImg
                :src="photo.src"
                :alt="photo.title || 'Photo'"
                class="h-full w-full scale-110 object-cover blur-2xl"
                loading="eager"
                :width="20"
                quality="10"
              />
            </div>
            
            <!-- Loading spinner overlay -->
            <div class="relative z-10 flex flex-col items-center gap-4">
              <div
                class="h-12 w-12 animate-spin rounded-full border-4 border-accent/30 border-t-accent"
              />
              <p class="text-sm font-medium text-black/80 dark:text-white/80 drop-shadow-lg">
                Loading image...
              </p>
            </div>
          </div>

          <!-- Main Image with smooth transition -->
          <NuxtImg
            :src="photo.src"
            :alt="photo.title || 'Photo'"
            class="w-full rounded-t-2xl object-contain transition-all duration-500 ease-out"
            :class="{ 
              'opacity-0 scale-95': !isImageLoaded || isTransitioning, 
              'opacity-100 scale-100': isImageLoaded && !isTransitioning 
            }"
            loading="eager"
            sizes="98vw sm:95vw md:85vw lg:80vw"
            :style="{ 
              maxHeight: '75vh',
            }"
            @load="handleImageLoad"
          />

          <!-- Subtle image overlay for better text readability -->
          <div
            v-if="isImageLoaded && !isTransitioning"
            class="absolute inset-0 rounded-t-2xl bg-gradient-to-t from-white/20 via-transparent to-transparent transition-opacity duration-500 dark:from-black/20 pointer-events-none"
          />
        </div>

        <!-- Enhanced caption area -->
        <div
          class="relative border-t backdrop-blur-sm px-4 py-4 transition-all duration-500 md:px-8 md:py-6 border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5"
          :class="{ 
            'opacity-0 translate-y-2': !isImageLoaded || isTransitioning, 
            'opacity-100 translate-y-0': isImageLoaded && !isTransitioning 
          }"
        >
          <!-- Title and description -->
          <div class="mb-4 text-center md:mb-6">
            <h3
              v-if="photo.title"
              class="mb-2 text-xl leading-tight font-semibold tracking-tight md:mb-3 md:text-2xl lg:text-3xl text-black dark:text-white"
            >
              {{ photo.title }}
            </h3>
            <p
              v-if="photo.description"
              class="mx-auto max-w-2xl px-2 text-sm leading-relaxed md:text-base lg:text-lg text-black/80 dark:text-white/80"
            >
              {{ photo.description }}
            </p>
          </div>

          <!-- Metadata with enhanced styling -->
          <div
            class="flex flex-wrap items-center justify-center gap-3 text-xs md:gap-6 md:text-sm text-black/70 dark:text-white/70"
          >
            <div
              v-if="photo.location"
              class="flex items-center gap-1.5 rounded-full border backdrop-blur-sm px-2.5 py-1.5 md:gap-2 md:px-3 md:py-2 border-black/20 bg-black/10 dark:border-white/20 dark:bg-white/10"
            >
              <Icon
                name="ph:map-pin-fill"
                class="h-3 w-3 flex-shrink-0 text-accent md:h-4 md:w-4"
              />
              <span class="font-medium">{{ photo.location }}</span>
            </div>

            <div
              v-if="photo.timestamp"
              class="flex items-center gap-1.5 rounded-full border backdrop-blur-sm px-2.5 py-1.5 md:gap-2 md:px-3 md:py-2 border-black/20 bg-black/10 dark:border-white/20 dark:bg-white/10"
            >
              <Icon
                name="ph:calendar-fill"
                class="h-3 w-3 flex-shrink-0 text-accent md:h-4 md:w-4"
              />
              <span class="font-medium">{{ photo.timestamp }}</span>
            </div>

            <div
              v-if="formattedCameraSettings"
              class="flex items-center gap-1.5 rounded-full border backdrop-blur-sm px-2.5 py-1.5 md:gap-2 md:px-3 md:py-2 border-black/20 bg-black/10 dark:border-white/20 dark:bg-white/10"
            >
              <Icon name="ph:camera-fill" class="h-3 w-3 flex-shrink-0 text-accent md:h-4 md:w-4" />
              <span class="text-xs font-medium md:text-sm">{{ formattedCameraSettings }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Previous button -->
    <button
      v-if="onPrevious && hasPrevious"
      class="absolute top-1/2 left-2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-accent/50 focus:ring-2 focus:ring-accent/50 focus:outline-none md:left-4 md:h-14 md:w-14 lg:left-8 border-black/20 bg-black/10 text-black hover:bg-black/20 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 cursor-pointer"
      :class="{ 'opacity-60': !isNavigationVisible, 'opacity-100': isNavigationVisible }"
      @click="onPrevious"
    >
      <Icon name="ph:caret-left-bold" class="h-4 w-4 md:h-6 md:w-6" />
    </button>

    <!-- Enhanced Next button -->
    <button
      v-if="onNext && hasNext"
      class="absolute top-1/2 right-2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-accent/50 focus:ring-2 focus:ring-accent/50 focus:outline-none md:right-4 md:h-14 md:w-14 lg:right-8 border-black/20 bg-black/10 text-black hover:bg-black/20 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 cursor-pointer"
      :class="{ 'opacity-60': !isNavigationVisible, 'opacity-100': isNavigationVisible }"
      @click="onNext"
    >
      <Icon name="ph:caret-right-bold" class="h-4 w-4 md:h-6 md:w-6" />
    </button>

    <!-- Hidden preload images - MUST have identical attributes to the visible image above -->
    <div v-if="nextPhotoSrc || previousPhotoSrc" class="sr-only" aria-hidden="true">
      <NuxtImg
        v-if="nextPhotoSrc"
        :src="nextPhotoSrc"
        alt=""
        loading="eager"
        sizes="98vw sm:95vw md:85vw lg:80vw"
        :style="{ maxHeight: '75vh' }"
      />
      <NuxtImg
        v-if="previousPhotoSrc"
        :src="previousPhotoSrc"
        alt=""
        loading="eager"
        sizes="98vw sm:95vw md:85vw lg:80vw"
        :style="{ maxHeight: '75vh' }"
      />
    </div>
  </div>
</template>
