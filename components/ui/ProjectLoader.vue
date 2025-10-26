<script setup lang="ts">
const props = defineProps<{
  isLoading?: boolean
}>()

const emit = defineEmits<{
  complete: []
}>()

const progress = ref(0)
const isVisible = ref(true)
const minDisplayTime = 1800 // Minimum display time in ms for premium feel
const startTime = ref(Date.now())

onMounted(async () => {
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

  // Show 100% briefly
  await new Promise(resolve => setTimeout(resolve, 400))

  // Fade out
  isVisible.value = false
  
  // Wait for fade animation to complete
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Emit complete event
  emit('complete')
})
</script>

<template>
  <div 
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
</template>

