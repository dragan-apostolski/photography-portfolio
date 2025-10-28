<script setup lang="ts">
interface Props {
  isLoading?: boolean
  mode?: 'simple' | 'viewfinder'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'viewfinder',
})

const emit = defineEmits<{
  complete: []
}>()

const progress = ref(0)
const isVisible = ref(true)
const minDisplayTime = 2000 // Minimum display time in ms for premium feel
const startTime = ref(0)
const elapsedTime = ref(0)
const focusAnimating = ref(true)

// Camera settings
const shutterSpeeds = [100, 200, 400, 800, 1000, 1500]
const apertures = ['1.4', '1.8', '2.7', '4', '5.6', '8', '11', '16']
const isoValues = [100, 200, 300, 400, 500, 600, 700, 800]
const shutterSpeed = ref(shutterSpeeds[0])
const aperture = ref(apertures[0])
const iso = ref(isoValues[0])

// Format time as MM:SS:MS
const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const milliseconds = Math.floor((ms % 1000) / 10)
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`
}

onMounted(async () => {
  // Initialize start time on client
  startTime.value = Date.now()
  
  // Set random camera settings only on client
  shutterSpeed.value = shutterSpeeds[Math.floor(Math.random() * shutterSpeeds.length)]
  aperture.value = apertures[Math.floor(Math.random() * apertures.length)]
  iso.value = isoValues[Math.floor(Math.random() * isoValues.length)]
  
  // Update elapsed time counter
  const timeInterval = setInterval(() => {
    elapsedTime.value = Date.now() - startTime.value
  }, 50)

  // Smooth progress animation
  const interval = setInterval(() => {
    progress.value += Math.random() * 8
    if (progress.value >= 85) {
      progress.value = 85
      clearInterval(interval)
    }
  }, 100)

  // Wait for data to load
  while (props.isLoading) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // Data is loaded, complete the progress quickly
  const completeInterval = setInterval(() => {
    progress.value += 5
    if (progress.value >= 100) {
      progress.value = 100
      clearInterval(completeInterval)
    }
  }, 50)

  // Ensure minimum display time
  const elapsed = Date.now() - startTime.value
  const remainingTime = Math.max(0, minDisplayTime - elapsed)
  
  if (remainingTime > 0) {
    await new Promise(resolve => setTimeout(resolve, remainingTime))
  }

  // Stop focus animation when complete
  focusAnimating.value = false

  // Show 100% briefly
  await new Promise(resolve => setTimeout(resolve, 400))

  // Fade out
  isVisible.value = false
  
  // Wait for fade animation to complete
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Clear time interval
  clearInterval(timeInterval)
  
  // Emit complete event
  emit('complete')
})
</script>

<template>
  <!-- Simple Mode -->
  <div 
    v-if="mode === 'simple'"
    class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary transition-opacity duration-500 dark:bg-primary-dark"
    :class="{ 'opacity-0': !isVisible }"
  >
    <!-- Animated Camera Icon -->
    <div class="mb-8 animate-pulse">
      <Icon 
        name="heroicons:camera" 
        class="h-16 w-16 text-accent md:h-20 md:w-20" 
      />
    </div>

    <!-- Loading Text -->
    <div class="mb-8 text-center">
      <h2 class="mb-2 text-2xl font-bold tracking-wide md:text-3xl">
        Loading Project
      </h2>
      <p class="text-sm opacity-60 md:text-base">
        Preparing your visual experience
      </p>
    </div>

    <!-- Progress Bar Container -->
    <div class="relative w-64 md:w-80">
      <!-- Background Track -->
      <div class="h-1 w-full overflow-hidden rounded-full bg-secondary-200 dark:bg-secondary-800">
        <!-- Animated Progress -->
        <div 
          class="h-full bg-gradient-to-r from-accent to-accent/70 transition-all duration-300 ease-out"
          :style="{ width: `${progress}%` }"
        />
      </div>
      
      <!-- Shimmer Effect -->
      <div class="absolute inset-0 overflow-hidden rounded-full">
        <div class="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </div>

    <!-- Percentage Counter -->
    <div class="mt-4 text-sm font-medium opacity-40">
      {{ Math.round(progress) }}%
    </div>
  </div>

  <!-- Viewfinder Mode -->
  <div 
    v-else
    class="fixed inset-0 z-50 flex items-center justify-center bg-primary transition-opacity duration-500 dark:bg-primary-dark"
    :class="{ 'opacity-0': !isVisible }"
  >
    <!-- Viewfinder Frame -->
    <div class="relative h-full w-full p-4 md:p-8">
      <!-- Background -->
      <div class="absolute inset-0 z-0 bg-secondary-50 dark:bg-secondary-950" />

      <!-- Corner Frames (Viewfinder Brackets) -->
      <div class="pointer-events-none absolute inset-0 z-30">
        <!-- Top Left Corner -->
        <div class="absolute top-4 left-4 h-16 w-16 border-t-2 border-l-2 border-accent md:top-8 md:left-8 md:h-20 md:w-20" />
        <!-- Top Right Corner -->
        <div class="absolute top-4 right-4 h-16 w-16 border-t-2 border-r-2 border-accent md:top-8 md:right-8 md:h-20 md:w-20" />
        <!-- Bottom Left Corner -->
        <div class="absolute bottom-4 left-4 h-16 w-16 border-b-2 border-l-2 border-accent md:bottom-8 md:left-8 md:h-20 md:w-20" />
        <!-- Bottom Right Corner -->
        <div class="absolute bottom-4 right-4 h-16 w-16 border-b-2 border-r-2 border-accent md:bottom-8 md:right-8 md:h-20 md:w-20" />
      </div>

      <!-- Top HUD Elements -->
      <div class="absolute top-6 right-6 z-30 flex items-start justify-end md:top-10 md:right-10">
        <!-- Battery Indicator -->
        <div class="flex items-center gap-2">
          <div class="flex h-5 w-10 items-center justify-end rounded-sm border-2 border-current p-0.5">
            <div class="h-full w-4/5 bg-current" />
          </div>
          <Icon name="heroicons:bolt" class="h-4 w-4" />
        </div>
      </div>

      <!-- Center Focus Square & Loading Text -->
      <div class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6">
        <!-- Focus Square -->
        <div 
          class="relative h-32 w-32 transition-all duration-1000 md:h-48 md:w-48"
          :class="focusAnimating ? 'scale-110 opacity-70' : 'scale-100 opacity-100'"
        >
          <!-- Focus indicator - just corner edges -->
          <div class="absolute inset-0">
            <!-- Animated corner lines -->
            <div 
              class="absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-accent transition-all duration-700"
              :class="focusAnimating ? 'scale-90' : 'scale-100'"
            />
            <div 
              class="absolute top-0 right-0 h-8 w-8 border-t-2 border-r-2 border-accent transition-all duration-700"
              :class="focusAnimating ? 'scale-90' : 'scale-100'"
            />
            <div 
              class="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-accent transition-all duration-700"
              :class="focusAnimating ? 'scale-90' : 'scale-100'"
            />
            <div 
              class="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-accent transition-all duration-700"
              :class="focusAnimating ? 'scale-90' : 'scale-100'"
            />
          </div>

          <!-- Center dot -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="h-1 w-1 rounded-full bg-accent" />
          </div>
        </div>

        <!-- Loading Text -->
        <div class="text-center">
          <h2 class="text-xl font-bold tracking-wide text-accent md:text-2xl">
            Loading Project
          </h2>
          <p class="mt-2 text-sm opacity-70 md:text-base">
            Preparing your visual experience
          </p>
        </div>

        <!-- Mobile Progress Bar -->
        <div class="relative w-[75%] md:hidden">
          <div class="h-1 w-full overflow-hidden bg-secondary-200/30 dark:bg-secondary-800/30">
            <div 
              class="h-full bg-accent transition-all duration-300 ease-out"
              :style="{ width: `${progress}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Bottom Loading Info -->
      <div class="absolute bottom-6 left-6 right-6 z-30 md:bottom-10 md:left-10 md:right-10">
        <div class="flex flex-col items-center justify-center gap-4">
          <!-- Desktop Progress Bar -->
          <div class="relative hidden w-full max-w-md md:block">
            <div class="h-1 w-full overflow-hidden bg-secondary-200/30 dark:bg-secondary-800/30">
              <div 
                class="h-full bg-accent transition-all duration-300 ease-out"
                :style="{ width: `${progress}%` }"
              />
            </div>
          </div>

          <!-- Camera Settings Display -->
          <div class="flex items-center gap-6 font-mono text-sm opacity-80 md:gap-8 md:text-base">
            <div class="flex items-center gap-1.5">
              <span>1/{{ shutterSpeed }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs opacity-60 md:text-sm">F</span>
              <span>{{ aperture }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs opacity-60 md:text-sm">ISO</span>
              <span>{{ iso }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid overlay for authentic camera feel -->
      <div class="pointer-events-none absolute inset-0 z-10 opacity-10">
        <div class="grid h-full w-full grid-cols-3 grid-rows-3 border border-current">
          <div class="border-r border-b border-current" />
          <div class="border-r border-b border-current" />
          <div class="border-b border-current" />
          <div class="border-r border-b border-current" />
          <div class="border-r border-b border-current" />
          <div class="border-b border-current" />
          <div class="border-r border-current" />
          <div class="border-r border-current" />
          <div />
        </div>
      </div>
    </div>
  </div>
</template>

