<template>
  <div>
    <!-- Loading State -->
    <div v-if="pending" class="flex h-screen items-center justify-center">
      <p class="text-lg opacity-60">Loading project...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !project" class="flex h-screen items-center justify-center">
      <div class="text-center">
        <h1 class="mb-4 text-2xl font-bold">Project Not Found</h1>
        <p class="mb-6 text-lg opacity-60">The requested project could not be found.</p>
        <NuxtLink
          to="/projects"
          class="hover:bg-opacity-90 inline-block rounded-lg bg-accent px-6 py-3 text-primary transition-colors dark:text-primary-dark"
        >
          Back to Projects
        </NuxtLink>
      </div>
    </div>

    <!-- Project Content -->
    <div v-else>
      <!-- Cover Photo Section -->
      <section class="relative h-screen w-full overflow-hidden">
        <div v-if="coverPhoto" class="h-full w-full">
          <NuxtImg
            :src="coverPhoto.src"
            :alt="coverPhoto.title || project.title"
            class="h-full w-full object-cover"
            loading="eager"
          />

          <!-- Cover Photo Overlay -->
          <div
            class="to-opacity-60 dark:to-opacity-60 absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary dark:to-primary-dark"
          />

          <!-- Cover Photo Content -->
          <div class="absolute right-0 bottom-0 left-0 p-6 md:p-12">
            <div class="max-w-2xl">
              <h1 class="mb-4 text-4xl font-bold text-primary-dark md:text-6xl dark:text-primary">
                {{ project.title }}
              </h1>
              <p class="mb-6 text-lg opacity-90 md:text-xl">
                {{ project.description }}
              </p>

              <div class="flex flex-wrap items-center gap-6 text-sm opacity-80">
                <div v-if="project.location" class="flex items-center">
                  <Icon name="heroicons:map-pin" class="mr-1 h-4 w-4" />
                  {{ project.location }}
                </div>
                <div class="flex items-center">
                  <Icon name="heroicons:calendar" class="mr-1 h-4 w-4" />
                  {{ formatDate(project.date) }}
                </div>
                <div class="flex items-center">
                  <Icon name="heroicons:photo" class="mr-1 h-4 w-4" />
                  {{ project.processedPhotos.length }} photos
                </div>
              </div>

              <!-- Tags -->
              <div v-if="project.tag?.length" class="mt-4 flex flex-wrap gap-2">
                <span
                  v-for="tag in project.tag"
                  :key="tag"
                  class="rounded-full bg-secondary-200 px-3 py-1 text-sm capitalize opacity-90 dark:bg-secondary-800"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <!-- Scroll Indicator -->
          <div class="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
            <Icon
              name="heroicons:chevron-down"
              class="h-6 w-6 text-primary-dark dark:text-primary"
            />
          </div>
        </div>
      </section>

      <!-- Horizontal Photo Gallery -->
      <section v-if="project.processedPhotos.length > 0" class="relative">
        <div
          ref="horizontalContainer"
          class="scrollbar-hide relative flex h-screen w-screen overflow-x-auto overflow-y-hidden"
        >
          <!-- Photos -->
          <div
            v-for="(photo, index) in project.processedPhotos"
            :key="photo.id"
            class="relative flex h-screen w-[50vw] flex-shrink-0 items-center justify-center px-2"
          >
            <NuxtImg
              :src="photo.src"
              :alt="photo.title || `${project.title} - Photo ${index + 1}`"
              class="max-h-full max-w-full object-contain"
              loading="lazy"
            />

            <!-- Photo Info Overlay -->
            <!-- <div
              v-if="photo.title || photo.description"
              class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white"
            >
              <h3 v-if="photo.title" class="mb-2 text-xl font-semibold">
                {{ photo.title }}
              </h3>
              <p v-if="photo.description" class="text-sm opacity-90">
                {{ photo.description }}
              </p>
            </div> -->
          </div>

          <!-- Related Projects Section -->
          <div
            v-if="relatedProjects.length > 0"
            class="box-border flex h-screen w-screen flex-shrink-0 flex-col justify-center bg-secondary-100 px-[5vw] md:px-[10vw] dark:bg-secondary-900"
          >
            <h2 class="mb-8 text-3xl font-semibold">Related Projects</h2>
            <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
              <article
                v-for="relatedProject in relatedProjects"
                :key="relatedProject.slug"
                class="group"
              >
                <NuxtLink :to="`/projects/${relatedProject.slug}`" class="block">
                  <div
                    class="mb-4 aspect-[4/3] overflow-hidden rounded-lg bg-secondary-200 dark:bg-secondary-800"
                  >
                    <NuxtImg
                      v-if="relatedProject.coverPhoto"
                      :src="relatedProject.coverPhoto"
                      :alt="relatedProject.title"
                      class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <h3 class="text-xl font-semibold transition-colors group-hover:text-accent">
                    {{ relatedProject.title }}
                  </h3>
                  <p class="mt-2 text-sm opacity-70">
                    {{ relatedProject.description }}
                  </p>
                </NuxtLink>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'

// Route
const route = useRoute()
const slug = route.params.slug as string

// Composables
const { getProjectWithPhotos, getAllProjects } = useProjects()

// Data fetching
const {
  data: project,
  pending,
  error,
} = await useAsyncData(`project-${slug}`, () => getProjectWithPhotos(slug), {
  default: () => null,
  server: false,
  lazy: false,
})

// Cover photo from project frontmatter or fallback to first photo
const coverPhoto = computed(() => {
  if (!project.value) return null

  // Use coverPhoto from frontmatter if available
  if (project.value.coverPhoto) {
    return {
      src: project.value.coverPhoto,
      title: project.value.title,
      id: 'cover',
    }
  }

  // Fallback to first photo
  if (project.value.processedPhotos.length === 0) return null
  return project.value.processedPhotos[0]
})

// Related projects
const { data: allProjects } = await useAsyncData('all-projects', getAllProjects)
const relatedProjects = computed((): Project[] => {
  if (!project.value || !allProjects.value) return []

  return allProjects.value
    .filter((p) => p.slug !== slug && p.tag.some((tag) => project.value!.tag.includes(tag)))
    .slice(0, 2)
})

// SEO
useHead({
  title: () => (project.value ? `${project.value.title} - Projects` : 'Project'),
})

useSeoMeta({
  title: () => (project.value ? `${project.value.title} - Projects` : 'Project'),
  description: () => project.value?.description || 'Photography project',
})

// Hybrid scroll functionality
const horizontalContainer = ref<HTMLElement | null>(null)

onMounted(() => {
  const container = horizontalContainer.value
  if (!container) return

  // Wait for images to load and then check dimensions
  nextTick(() => {
    setTimeout(() => {
      // Container dimensions check for debugging if needed
    }, 1000)
  })

  const handleWheel = (e: WheelEvent) => {
    // Get the container's position relative to viewport
    const containerRect = container.getBoundingClientRect()
    const isContainerVisible = containerRect.top <= 0 && containerRect.bottom > 0

    // Only handle horizontal scrolling if the container is visible and has scrollable content
    if (isContainerVisible && container.scrollWidth > container.clientWidth) {
      // Check if we're at the beginning and trying to scroll backwards
      const isAtBeginning = container.scrollLeft <= 0
      const isScrollingBackwards = e.deltaY < 0

      // Check if we're at the end and trying to scroll forwards
      const maxScroll = container.scrollWidth - container.clientWidth
      const isAtEnd = container.scrollLeft >= maxScroll - 1 // -1 for rounding
      const isScrollingForwards = e.deltaY > 0

      // Allow vertical scroll if at boundaries and trying to go beyond
      if ((isAtBeginning && isScrollingBackwards) || (isAtEnd && isScrollingForwards)) {
        // Allow normal vertical scrolling
        return
      }

      // Otherwise, handle horizontal scrolling
      e.preventDefault()
      e.stopPropagation()

      // Scroll horizontally
      container.scrollLeft += e.deltaY
    }
    // Otherwise, allow normal vertical scrolling
  }

  // Add wheel listener to the window to catch all scroll events
  window.addEventListener('wheel', handleWheel, { passive: false })

  onUnmounted(() => {
    window.removeEventListener('wheel', handleWheel)
  })
})

// Utilities
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>
