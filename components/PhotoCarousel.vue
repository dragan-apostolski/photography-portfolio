<script setup lang="ts">
import type { Photo } from '~/types/photo'
import CarouselNavButton from './ui/CarouselNavButton.vue'
import Button from './ui/Button.vue'

interface Props {
  photos: Photo[]
}

const props = defineProps<Props>()
const currentIndex = ref(0)
const intervalId = ref<NodeJS.Timeout | null>(null)
const isClient = ref(false)

// Fix hydration mismatch by setting isClient flag only on client side
onMounted(() => {
  isClient.value = true
})

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
  currentIndex.value = index
  startAutoplay() // Reset the timer when manually changing slides
}

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % props.photos.length
}

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + props.photos.length) % props.photos.length
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
      class="absolute top-1/2 left-1/2 z-30 -translate-x-1/2 -translate-y-1/2 space-y-4 text-center lg:left-32 lg:translate-x-0 lg:text-left"
    >
      <h2 class="text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-6xl">
        {{ props.photos[currentIndex].description }}
      </h2>
      <Button custom-classes="text-white">
        {{ props.photos[currentIndex].buttonTitle }}
      </Button>
    </div>

    <!-- Images Container with smooth sliding transition -->
    <div class="bg-background-primary dark:bg-background-primary-dark relative h-full w-full">
      <div
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
            format="webp"
            loading="eager"
            placeholder
          />
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
          :key="photo.title"
          :label="photo.title"
          :active="index === currentIndex"
          @click="goTo(index)"
          @mouseenter="stopAutoplay"
          @mouseleave="startAutoplay"
        />
      </div>
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
