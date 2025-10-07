<script setup lang="ts">
interface Props {
  position?: 'bottom-4' | 'bottom-6' | 'bottom-8' | 'bottom-12' | 'bottom-16' | 'bottom-20'
  mobilePosition?: 'bottom-4' | 'bottom-6' | 'bottom-8' | 'bottom-12' | 'bottom-16' | 'bottom-20'
  scrollAmount?: number // Viewport percentage (0.5 = 50%)
  label?: string
  variant?: 'auto' | 'light' // auto = responsive to color mode, light = always white text
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom-4',
  mobilePosition: 'bottom-4',
  scrollAmount: 0.5,
  label: 'Explore',
  variant: 'auto'
})

// Computed classes based on variant
const textClasses = computed(() => {
  if (props.variant === 'light') {
    return 'text-white/90 hover:text-accent'
  }
  return 'text-gray-800 hover:text-accent dark:text-white/90 dark:hover:text-accent'
})

const mobileTextClasses = computed(() => {
  if (props.variant === 'light') {
    return 'text-white/80 active:text-accent'
  }
  return 'text-gray-800 active:text-accent dark:text-white/80 dark:active:text-accent'
})

// Scroll incentive functionality
const scrollDown = () => {
  const scrollAmount = window.innerHeight * props.scrollAmount
  window.scrollTo({
    top: window.scrollY + scrollAmount,
    behavior: 'smooth'
  })
}
</script>

<template>
  <!-- Desktop Scroll Incentive Icon -->
  <div :class="`absolute ${position} left-1/2 z-20 -translate-x-1/2 hidden md:block`">
    <button
      aria-label="Scroll to explore more"
      :class="`group flex flex-col items-center gap-2 ${textClasses} transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer`"
      @click="scrollDown"
    >
      <!-- Animated chevron down icon -->
      <div class="relative">
        <Icon 
          name="material-symbols:keyboard-arrow-down" 
          class="h-8 w-8 animate-bounce group-hover:text-accent transition-colors duration-300" 
        />
        <!-- Second chevron for enhanced effect -->
        <Icon 
          name="material-symbols:keyboard-arrow-down" 
          class="absolute top-2 left-0 h-8 w-8 animate-bounce opacity-50 group-hover:text-accent transition-all duration-300" 
          style="animation-delay: 0.2s"
        />
      </div>
      <!-- Text label -->
      <span class="text-xs font-medium uppercase tracking-wider opacity-80 group-hover:opacity-100 transition-opacity duration-300">
        {{ label }}
      </span>
    </button>
  </div>

  <!-- Mobile Scroll Incentive Icon -->
  <div :class="`absolute ${mobilePosition} left-1/2 z-20 -translate-x-1/2 md:hidden`">
    <button
      aria-label="Scroll to explore more"
      :class="`group flex flex-col items-center gap-1 ${mobileTextClasses} transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer`"
      @click="scrollDown"
    >
      <!-- Animated chevron down icon -->
      <div class="relative">
        <Icon 
          name="material-symbols:keyboard-arrow-down" 
          class="h-6 w-6 animate-bounce group-active:text-accent transition-colors duration-300" 
        />
        <!-- Second chevron for enhanced effect -->
        <Icon 
          name="material-symbols:keyboard-arrow-down" 
          class="absolute top-1.5 left-0 h-6 w-6 animate-bounce opacity-50 group-active:text-accent transition-all duration-300" 
          style="animation-delay: 0.2s"
        />
      </div>
      <!-- Text label -->
      <span class="text-xs font-medium uppercase tracking-wider opacity-80 group-active:opacity-100 transition-opacity duration-300">
        {{ label }}
      </span>
    </button>
  </div>
</template>
