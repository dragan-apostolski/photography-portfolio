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
}

interface PhotoDetailProps {
  photo: Photo
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
}

const props = withDefaults(defineProps<PhotoDetailProps>(), {
  onNext: undefined,
  onPrevious: undefined,
  hasNext: false,
  hasPrevious: false,
})

const isNavigationVisible = ref(false)
const photoWrapper = ref<HTMLElement | null>(null)

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
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl transition-all duration-500 ease-out"
    @click="handleWrapperClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Enhanced backdrop overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60"></div>

    <!-- Close button -->
    <button
      class="absolute top-4 right-4 md:top-6 md:right-6 z-20 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur-md border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/50"
      @click="onClose"
    >
      <Icon name="ph:x-bold" class="h-4 w-4 md:h-5 md:w-5" />
    </button>

    <!-- Main modal container -->
    <div class="relative z-10 mx-2 md:mx-4 max-h-[98vh] md:max-h-[95vh] max-w-[98vw] md:max-w-[85vw] lg:max-w-[80vw]">
      <!-- Image container with enhanced styling -->
      <div class="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
        <!-- Image wrapper -->
        <div class="relative">
          <NuxtImg
            :src="photo.src"
            :alt="photo.title || 'Photo'"
            class="max-h-[60vh] sm:max-h-[65vh] md:max-h-[70vh] lg:max-h-[75vh] w-full rounded-t-2xl object-contain"
            loading="lazy"
            format="webp"
            sizes="98vw sm:95vw md:85vw lg:80vw"
          />
          
          <!-- Subtle image overlay for better text readability -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-t-2xl"></div>
        </div>

        <!-- Enhanced caption area -->
        <div class="relative px-4 py-4 md:px-8 md:py-6 bg-white/5 backdrop-blur-sm border-t border-white/10">
          <!-- Title and description -->
          <div class="text-center mb-4 md:mb-6">
            <h3 v-if="photo.title" class="text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight text-white mb-2 md:mb-3 leading-tight">
              {{ photo.title }}
            </h3>
            <p v-if="photo.description" class="text-sm md:text-base lg:text-lg text-white/80 leading-relaxed max-w-2xl mx-auto px-2">
              {{ photo.description }}
            </p>
          </div>

          <!-- Metadata with enhanced styling -->
          <div class="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-xs md:text-sm text-white/70">
            <div v-if="photo.location" class="flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Icon name="ph:map-pin-fill" class="h-3 w-3 md:h-4 md:w-4 text-accent flex-shrink-0" />
              <span class="font-medium">{{ photo.location }}</span>
            </div>

            <div v-if="photo.timestamp" class="flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Icon name="ph:calendar-fill" class="h-3 w-3 md:h-4 md:w-4 text-accent flex-shrink-0" />
              <span class="font-medium">{{ photo.timestamp }}</span>
            </div>

            <div v-if="formattedCameraSettings" class="flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-3 md:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Icon name="ph:camera-fill" class="h-3 w-3 md:h-4 md:w-4 text-accent flex-shrink-0" />
              <span class="font-medium text-xs md:text-sm">{{ formattedCameraSettings }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Previous button -->
    <button
      v-if="onPrevious && hasPrevious"
      class="absolute top-1/2 left-2 md:left-4 lg:left-8 z-20 flex h-10 w-10 md:h-14 md:w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/50"
      :class="{ 'opacity-60': !isNavigationVisible, 'opacity-100': isNavigationVisible }"
      @click="onPrevious"
    >
      <Icon name="ph:caret-left-bold" class="h-4 w-4 md:h-6 md:w-6" />
    </button>

    <!-- Enhanced Next button -->
    <button
      v-if="onNext && hasNext"
      class="absolute top-1/2 right-2 md:right-4 lg:right-8 z-20 flex h-10 w-10 md:h-14 md:w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-110 hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/50"
      :class="{ 'opacity-60': !isNavigationVisible, 'opacity-100': isNavigationVisible }"
      @click="onNext"
    >
      <Icon name="ph:caret-right-bold" class="h-4 w-4 md:h-6 md:w-6" />
    </button>
  </div>
</template>
