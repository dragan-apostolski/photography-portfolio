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
    class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl transition-all duration-300"
    @click="handleWrapperClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Close button -->
    <button
      class="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-secondary-200/70 text-xl text-primary-dark transition-all duration-300 hover:bg-accent dark:bg-secondary-900/70"
      :class="{ 'opacity-0': !isNavigationVisible, 'opacity-100': isNavigationVisible }"
      @click="onClose"
    >
      ×
    </button>

    <!-- Image container -->
    <div
      class="relative max-h-[90vh] max-w-[90vw] rounded-lg bg-secondary-200 p-4 shadow-xl dark:bg-secondary-700"
    >
      <NuxtImg
        :src="photo.src"
        :alt="photo.title || 'Photo'"
        class="max-h-[75vh] max-w-full rounded object-contain"
        loading="lazy"
        format="webp"
        sizes="md:100vw, lg:90vw"
      />

      <!-- Caption area -->
      <div class="mt-4 text-center">
        <h3 v-if="photo.title" class="text-xl font-semibold tracking-tight">{{ photo.title }}</h3>
        <p v-if="photo.description" class="mt-1 text-sm opacity-90">{{ photo.description }}</p>

        <div class="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs opacity-75">
          <span v-if="photo.location" class="flex items-center">
            <Icon name="ph:map-pin" class="mr-1 h-3 w-3" />
            {{ photo.location }}
          </span>

          <span v-if="photo.timestamp" class="flex items-center">
            <Icon name="ph:calendar" class="mr-1 h-3 w-3" />
            {{ photo.timestamp }}
          </span>

          <span v-if="formattedCameraSettings" class="flex items-center">
            <Icon name="ph:camera" class="mr-1 h-3 w-3" />
            {{ formattedCameraSettings }}
          </span>
        </div>
      </div>
    </div>

    <!-- Previous button -->
    <button
      v-if="onPrevious && hasPrevious"
      class="absolute top-1/2 left-4 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-secondary-200/70 text-primary-dark transition-all duration-300 hover:bg-accent dark:bg-secondary-900/70"
      :class="{ 'opacity-0': !isNavigationVisible, 'opacity-100': isNavigationVisible }"
      @click="onPrevious"
    >
      <Icon name="ph:caret-left-bold" class="h-6 w-6" />
    </button>

    <!-- Next button -->
    <button
      v-if="onNext && hasNext"
      class="absolute top-1/2 right-4 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-secondary-200/70 text-primary-dark transition-all duration-300 hover:bg-accent dark:bg-secondary-900/70"
      :class="{ 'opacity-0': !isNavigationVisible, 'opacity-100': isNavigationVisible }"
      @click="onNext"
    >
      <Icon name="ph:caret-right-bold" class="h-6 w-6" />
    </button>
  </div>
</template>
