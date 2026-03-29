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
  projectSlug?: string
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

// Loading state is immediate — no delay, so it works for both cached and uncached images
const showLoadingState = computed(() => !isImageLoaded.value)

// Reset loading state when photo changes (navigation)
watch(
  () => props.photo.id,
  () => {
    isTransitioning.value = true
    isImageLoaded.value = false

    // Reset transition after a brief delay to allow re-render
    setTimeout(() => {
      isTransitioning.value = false
    }, 50)
  }
)

// Handle image load
const handleImageLoad = () => {
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

// Convert aspect ratio string to numeric ratio for placeholder sizing
const numericAspectRatio = computed(() => {
  switch (props.photo.aspectRatio) {
    case 'vertical':
      return 2 / 3
    case 'horizontal':
      return 3 / 2
    case 'square':
      return 1
    default:
      return 3 / 2
  }
})

// Calculate placeholder dimensions based on aspect ratio and viewport constraints
const placeholderStyle = computed(() => {
  const ratio = numericAspectRatio.value
  const targetHeightVh = 60

  return {
    aspectRatio: `${ratio}`,
    maxHeight: 'calc(98vh - 13rem)',
    width: `min(${targetHeightVh * ratio}vh, 85vw)`,
    maxWidth: '85vw',
  }
})

// Fetch project title if projectSlug exists
const { getProjectBySlug } = useProjects()
const { data: project } = await useAsyncData(
  () => `project-${props.photo.projectSlug || 'none'}`,
  async () => {
    if (!props.photo.projectSlug) return null
    return await getProjectBySlug(props.photo.projectSlug)
  },
  {
    default: () => null,
    watch: [() => props.photo.projectSlug],
  }
)
</script>

<template>
  <div
    ref="photoWrapper"
    class="fixed top-0 left-0 z-50 flex h-dvh w-full items-center justify-center bg-white/80 backdrop-blur-2xl transition-all duration-500 ease-out dark:bg-black/80"
    @click="handleWrapperClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Enhanced backdrop overlay -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/60 dark:from-black/60 dark:via-black/40 dark:to-black/60"
    />

    <!-- Close button -->
    <button
      class="absolute top-4 right-4 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/20 bg-black/10 text-black backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-accent/50 hover:bg-black/20 focus:ring-2 focus:ring-accent/50 focus:outline-none md:top-6 md:right-6 md:h-12 md:w-12 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
      @click="onClose"
    >
      <Icon name="ph:x-bold" class="h-4 w-4 md:h-5 md:w-5" />
    </button>

    <!-- Main modal container -->
    <div
      class="relative z-10 mx-2 flex max-h-[98vh] max-w-[98vw] flex-col items-center md:mx-4 md:max-h-[95vh] md:max-w-[85vw] lg:max-w-[80vw]"
    >
      <!-- Image container with enhanced styling -->
      <div
        class="relative flex min-h-0 w-fit flex-col overflow-hidden rounded-2xl border border-black/10 bg-black/5 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-white/5"
      >
        <!-- Image wrapper -->
        <div class="relative min-h-0 overflow-hidden">
          <!-- Sizing placeholder — in-flow, provides container dimensions before image loads -->
          <div
            v-if="showLoadingState"
            class="flex items-center justify-center overflow-hidden rounded-t-2xl bg-black/5 dark:bg-white/5"
            :style="placeholderStyle"
          >
            <!-- Blurred placeholder image -->
            <div class="absolute inset-0 overflow-hidden">
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
              <p class="text-sm font-medium text-black/80 drop-shadow-lg dark:text-white/80">
                Loading image...
              </p>
            </div>
          </div>

          <!-- Main Image with smooth transition -->
          <NuxtImg
            :src="photo.src"
            :alt="photo.title || 'Photo'"
            class="max-h-[calc(98vh-13rem)] rounded-t-2xl object-contain transition-all duration-500 ease-out md:max-h-[calc(95vh-13rem)]"
            :class="{
              'scale-95 opacity-0': !isImageLoaded || isTransitioning,
              'scale-100 opacity-100': isImageLoaded && !isTransitioning,
            }"
            :style="
              !isImageLoaded
                ? { position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }
                : {}
            "
            loading="eager"
            sizes="98vw sm:95vw md:85vw lg:80vw"
            @load="handleImageLoad"
          />

          <!-- Subtle image overlay for better text readability -->
          <div
            v-if="isImageLoaded && !isTransitioning"
            class="pointer-events-none absolute inset-0 rounded-t-2xl bg-gradient-to-t from-white/20 via-transparent to-transparent transition-opacity duration-500 dark:from-black/20"
          />
        </div>

        <!-- Enhanced caption area -->
        <div
          class="relative w-0 min-w-full flex-shrink-0 border-t border-black/10 bg-black/5 px-4 py-4 backdrop-blur-sm transition-all duration-500 md:px-8 md:py-6 dark:border-white/10 dark:bg-white/5"
          :class="{
            'translate-y-2 opacity-0': !isImageLoaded || isTransitioning,
            'translate-y-0 opacity-100': isImageLoaded && !isTransitioning,
          }"
        >
          <!-- Title and description -->
          <div class="mb-4 text-center md:mb-6">
            <h3
              v-if="photo.title"
              class="mb-2 text-xl leading-tight tracking-tight text-black md:mb-3 md:text-2xl lg:text-3xl dark:text-white"
            >
              {{ photo.title }}
            </h3>
            <p
              v-if="photo.description"
              class="lg:text-md mx-auto px-2 text-xs leading-relaxed break-words text-black/80 md:text-base dark:text-white/80"
            >
              {{ photo.description }}
            </p>
          </div>

          <!-- Metadata with enhanced styling -->
          <div
            class="flex flex-wrap items-center justify-center gap-3 text-xs text-black/70 md:gap-6 md:text-sm dark:text-white/70"
          >
            <div
              v-if="photo.location"
              class="flex items-center gap-1.5 rounded-full border border-black/20 bg-black/10 px-2.5 py-1.5 backdrop-blur-sm md:gap-2 md:px-3 md:py-2 dark:border-white/20 dark:bg-white/10"
            >
              <Icon
                name="ph:map-pin-fill"
                class="h-3 w-3 flex-shrink-0 text-accent md:h-4 md:w-4"
              />
              <span class="font-medium">{{ photo.location }}</span>
            </div>

            <div
              v-if="photo.timestamp"
              class="flex items-center gap-1.5 rounded-full border border-black/20 bg-black/10 px-2.5 py-1.5 backdrop-blur-sm md:gap-2 md:px-3 md:py-2 dark:border-white/20 dark:bg-white/10"
            >
              <Icon
                name="ph:calendar-fill"
                class="h-3 w-3 flex-shrink-0 text-accent md:h-4 md:w-4"
              />
              <span class="font-medium">{{ photo.timestamp }}</span>
            </div>

            <div
              v-if="formattedCameraSettings"
              class="flex items-center gap-1.5 rounded-full border border-black/20 bg-black/10 px-2.5 py-1.5 backdrop-blur-sm md:gap-2 md:px-3 md:py-2 dark:border-white/20 dark:bg-white/10"
            >
              <Icon name="ph:camera-fill" class="h-3 w-3 flex-shrink-0 text-accent md:h-4 md:w-4" />
              <span class="text-xs font-medium md:text-sm">{{ formattedCameraSettings }}</span>
            </div>
          </div>

          <!-- Action badges -->
          <div class="mt-4 flex flex-wrap items-center justify-center gap-2">
            <!-- Project reference badge -->
            <NuxtLink
              v-if="photo.projectSlug && project"
              :to="`/projects/${photo.projectSlug}`"
              class="group flex cursor-pointer items-center gap-2 rounded-full border border-black/20 bg-black/10 px-3 py-2 text-xs text-black/80 backdrop-blur-sm transition-all hover:bg-black/20 hover:text-black md:gap-2.5 md:px-4 md:py-2.5 md:text-sm dark:border-white/20 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20 dark:hover:text-white"
            >
              <Icon
                name="ph:folder-fill"
                class="h-3.5 w-3.5 flex-shrink-0 text-accent md:h-4 md:w-4"
              />
              <span class="font-medium">Part of {{ project.title }} project</span>
              <Icon
                name="ph:arrow-right-bold"
                class="h-3 w-3 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1 md:h-3.5 md:w-3.5"
              />
            </NuxtLink>

            <!-- Buy Print badge -->
            <!--            <NuxtLink-->
            <!--              :to="`/prints?photo=${photo.id}`"-->
            <!--              class="group flex cursor-pointer items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-accent backdrop-blur-sm transition-all hover:bg-accent/20 md:gap-2.5 md:px-4 md:py-2.5 md:text-sm"-->
            <!--            >-->
            <!--              <Icon name="ph:frame-corners" class="h-3.5 w-3.5 flex-shrink-0 md:h-4 md:w-4" />-->
            <!--              <span class="font-medium">Buy Print</span>-->
            <!--              <Icon-->
            <!--                name="ph:arrow-right-bold"-->
            <!--                class="h-3 w-3 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1 md:h-3.5 md:w-3.5"-->
            <!--              />-->
            <!--            </NuxtLink>-->
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Previous button -->
    <button
      v-if="onPrevious && hasPrevious"
      class="absolute top-1/2 left-2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-black/20 bg-black/10 text-black backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-accent/50 hover:bg-black/20 focus:ring-2 focus:ring-accent/50 focus:outline-none md:left-4 md:h-14 md:w-14 lg:left-8 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
      :class="{ 'opacity-60': !isNavigationVisible, 'opacity-100': isNavigationVisible }"
      @click="onPrevious"
    >
      <Icon name="ph:caret-left-bold" class="h-4 w-4 md:h-6 md:w-6" />
    </button>

    <!-- Enhanced Next button -->
    <button
      v-if="onNext && hasNext"
      class="absolute top-1/2 right-2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-black/20 bg-black/10 text-black backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-accent/50 hover:bg-black/20 focus:ring-2 focus:ring-accent/50 focus:outline-none md:right-4 md:h-14 md:w-14 lg:right-8 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
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
