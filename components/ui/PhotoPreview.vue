<script setup lang="ts">
interface PhotoPreviewProps {
  photo: {
    src: string
    title?: string
    description?: string
    tag?: string
  }
  aspectRatio?: 'square' | 'vertical' | 'horizontal'
  ctaLink?: string
}

const props = withDefaults(defineProps<PhotoPreviewProps>(), {
  aspectRatio: 'square',
  ctaLink: '/gallery',
})

const isHovered = ref(false)
const handleMouseEnter = () => {
  isHovered.value = true
}
const handleMouseLeave = () => {
  isHovered.value = false
}

// Generate full link with tag filter if provided
const fullLink = computed(() => {
  if (!props.photo.tag) return props.ctaLink
  return `${props.ctaLink}?tag=${encodeURIComponent(props.photo.tag)}`
})

// Define aspect ratio classes
const aspectRatioClass = computed(() => {
  switch (props.aspectRatio) {
    case 'vertical':
      return 'aspect-[2/3]'
    case 'horizontal':
      return 'aspect-[3/2]'
    default:
      return 'aspect-square'
  }
})
</script>

<template>
  <NuxtLink :to="fullLink" class="block">
    <div
      class="group relative cursor-pointer overflow-hidden rounded-md"
      :class="aspectRatioClass"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <!-- Photo -->
      <NuxtImg
        :src="photo.src"
        :alt="photo.title || 'Photo'"
        class="h-full w-full object-cover transition-transform duration-300 ease-in-out"
        :class="{ 'scale-105': isHovered }"
        loading="lazy"
        sizes="sm:100vw md:40vw lg:30vw"
      />

      <!-- Overlay that appears on hover -->
      <div
        class="absolute inset-0 bg-primary opacity-0 transition-opacity duration-300 ease-in-out"
        :class="{ 'opacity-25': isHovered }"
      />

      <!-- Text and CTA container -->
      <div
        class="absolute right-0 bottom-0 left-0 transform p-4 text-primary-dark transition-transform duration-300 ease-in-out"
        :class="{ 'translate-y-0': isHovered, 'translate-y-full': !isHovered }"
      >
        <!-- Title -->
        <h3 v-if="photo.title" class="mb-1 text-lg font-medium">
          {{ photo.title }}
        </h3>

        <!-- Description -->
        <p v-if="photo.description" class="mb-3 text-sm opacity-90">
          {{ photo.description }}
        </p>
      </div>
    </div>
  </NuxtLink>
</template>
