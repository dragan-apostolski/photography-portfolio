<script setup lang="ts">
import type { Photo } from '~/types/photo'
import CarouselNavButton from './ui/CarouselNavButton.vue'
import Button from './ui/Button.vue'
import ScrollIncentive from './ui/ScrollIncentive.vue'

interface CarouselPhoto extends Photo {
  projectSlug?: string
}

interface Props {
  photos: CarouselPhoto[]
}

const props = defineProps<Props>()
const currentIndex = ref(0)
const intervalId = ref<NodeJS.Timeout | null>(null)

// Start autoplay and handle cleanup
onMounted(() => {
  startAutoplay()
})

onBeforeUnmount(() => {
  stopAutoplay()
})

// Autoplay functionality
const startAutoplay = () => {
  stopAutoplay()
  intervalId.value = setInterval(() => {
    next()
  }, 5000)
}

const stopAutoplay = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
}

// Navigation methods
const goTo = (index: number) => {
  if (props.photos && props.photos.length > 0) {
    currentIndex.value = index
    startAutoplay() // Reset the timer when manually changing slides
  }
}

const next = () => {
  if (props.photos && props.photos.length > 0) {
    currentIndex.value = (currentIndex.value + 1) % props.photos.length
  }
}

const prev = () => {
  if (props.photos && props.photos.length > 0) {
    currentIndex.value = (currentIndex.value - 1 + props.photos.length) % props.photos.length
  }
}

// Handle button click navigation
const handleButtonClick = () => {
  const currentPhoto = props.photos[currentIndex.value]
  
  if (currentPhoto?.projectSlug) {
    // Navigate to the project page
    navigateTo(`/projects/${currentPhoto.projectSlug}`)
  }
}

// Watch for changes and apply transitions
watch(currentIndex, () => {
  // Restart autoplay when slide changes
  startAutoplay()
})
</script>

<template>
  <div class="relative h-full w-full overflow-hidden">
    <!-- Description and CTA overlay -->
    <div
      v-if="props.photos && props.photos.length > 0"
      class="absolute top-1/2 left-1/2 z-30 -translate-x-1/2 -translate-y-1/2 space-y-6 text-center lg:left-32 lg:translate-x-0 lg:text-left"
    >
      <!-- Featured Projects Badge -->
      <div class="flex items-center justify-center gap-2 lg:justify-start">
        <div class="flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-2 border border-white/30">
          <Icon name="material-symbols:collections-bookmark" class="h-5 w-5 text-white" />
          <span class="text-sm font-medium text-white uppercase tracking-wide">Featured Project</span>
        </div>
      </div>

      <!-- Project Title -->
      <h2 class="text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-6xl drop-shadow-2xl">
        {{ props.photos[currentIndex]?.title }}
      </h2>

      <!-- Project Description (if available) -->
      <p 
        v-if="props.photos[currentIndex]?.description" 
        class="hidden text-lg text-white/90 max-w-xl lg:mx-0 lg:block drop-shadow-lg"
      >
        {{ props.photos[currentIndex]?.description }}
      </p>

      <!-- CTA Button with click handler -->
      <Button 
        custom-classes="text-white"
        @click="handleButtonClick"
      >
        <span class="flex items-center gap-2">
          View Project
          <Icon name="material-symbols:arrow-forward" class="h-5 w-5" />
        </span>
      </Button>
    </div>

    <!-- Images Container with smooth sliding transition -->
    <div class="bg-background-primary dark:bg-background-primary-dark relative h-full w-full">
      <div
        v-if="props.photos && props.photos.length > 0"
        class="relative h-full w-full transition-transform duration-700 ease-in-out"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div
          v-for="(photo, index) in props.photos"
          :key="photo.src"
          class="absolute top-0 left-0 h-full w-full"
          :style="{ transform: `translateX(${index * 100}%)` }"
        >
          <NuxtImg
            :src="photo.src"
            :alt="photo.alt"
            class="h-full w-full object-cover"
            quality="100"
            loading="eager"
            placeholder
          />
          <!-- Gradient overlay for better text readability -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent lg:from-black/60"></div>
        </div>
      </div>
    </div>

    <!-- Navigation - Only render once client-side is ready -->
    <ClientOnly>
      <div
        class="absolute bottom-32 left-0 z-20 hidden w-full justify-around gap-8 px-4 text-center md:flex md:gap-16"
      >
        <CarouselNavButton
          v-for="(photo, index) in props.photos"
          :key="photo.title || photo.id || index"
          :label="photo.title || `Photo ${index + 1}`"
          :active="index === currentIndex"
          @click="goTo(index)"
          @mouseenter="stopAutoplay"
          @mouseleave="startAutoplay"
        />
      </div>
      
      <!-- Scroll Incentive Icon -->
      <ScrollIncentive 
        position="bottom-6" 
        mobile-position="bottom-6"
        variant="light"
      />
    </ClientOnly>

    <!-- Mobile Arrow Navigation -->
    <div
      class="absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-between px-4 md:hidden"
    >
      <button
        aria-label="Previous photo"
        class="flex items-center justify-center rounded-full bg-white/30 p-2 text-white transition-colors hover:bg-white/50 focus:ring-2 focus:ring-accent focus:outline-none"
        @click="prev"
        @mouseenter="stopAutoplay"
        @mouseleave="startAutoplay"
      >
        <Icon name="material-symbols:arrow-back-ios" class="h-6 w-6" />
      </button>
      <button
        aria-label="Next photo"
        class="flex items-center justify-center rounded-full bg-white/30 p-2 text-white transition-colors hover:bg-white/50 focus:ring-2 focus:ring-accent focus:outline-none"
        @click="next"
        @mouseenter="stopAutoplay"
        @mouseleave="startAutoplay"
      >
        <Icon name="material-symbols:arrow-forward-ios" class="h-6 w-6" />
      </button>
    </div>
  </div>
</template>
