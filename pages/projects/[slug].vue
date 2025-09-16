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
            format="webp"
            quality="80"
            loading="lazy"
            placeholder
            sizes="100vw sm:400px md:800px lg:100vw"
          />

          <!-- Cover Photo Overlay -->
          <div
            class="to-opacity-60 dark:to-opacity-60 absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary dark:to-primary-dark"
          />

          <!-- Cover Photo Content -->
          <div class="absolute right-0 bottom-0 left-0 p-6 md:p-12">
            <div class="max-w-2xl">
              <h1 class="mb-4 text-4xl font-bold text-primary md:text-6xl dark:text-primary-dark">
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

      <!-- Desktop: Horizontal Photo Gallery -->
      <div class="hidden xl:block">
        <HorizontalScroll
          v-if="horizontalScrollItems.length > 0"
          :items="horizontalScrollItems"
          :start-offset="0.1"
          :end-offset="0.1"
        >
          <template #item="{ item, index }">
            <!-- Photo Item -->
            <div
              v-if="item.type === 'photo'"
              class="relative flex h-full w-full items-center justify-center bg-primary px-4 md:px-8 dark:bg-primary-dark"
            >
              <NuxtImg
                :src="(item.photo as any).src"
                :alt="(item.photo as any).title || `${project.title} - Photo ${index + 1}`"
                class="max-h-[90vh] max-w-full rounded-2xl object-contain"
                loading="lazy"
                sizes="100vw xl:80vw"
              />
            </div>
          </template>
        </HorizontalScroll>
      </div>

      <!-- Mobile/Tablet: Traditional Vertical Gallery -->
      <div class="block xl:hidden">
        <!-- Photo Gallery -->
        <section v-if="project.processedPhotos.length > 0" class="px-4 py-8">
          <div class="mx-auto max-w-4xl space-y-8">
            <div v-for="(photo, index) in project.processedPhotos" :key="photo.id" class="group">
              <!-- Photo Container -->
              <div
                class="relative overflow-hidden rounded-2xl bg-secondary-100 dark:bg-secondary-800"
              >
                <NuxtImg
                  :src="photo.src"
                  :alt="photo.title || `${project.title} - Photo ${index + 1}`"
                  class="w-full object-contain"
                  loading="lazy"
                  format="webp"
                  sizes="(max-width: 768px) 100vw, 768px"
                />

                <!-- Photo Metadata (if available) -->
                <div
                  v-if="photo.title || photo.description"
                  class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  <h3 v-if="photo.title" class="mb-2 text-lg font-semibold">
                    {{ photo.title }}
                  </h3>
                  <p v-if="photo.description" class="text-sm opacity-90">
                    {{ photo.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Related Projects Section (Shared for all devices) -->
      <section
        v-if="relatedProjects.length > 0"
        class="bg-secondary-100 px-4 py-12 md:px-8 dark:bg-secondary-900"
      >
        <div class="mx-auto max-w-6xl">
          <h2 class="mb-8 text-center text-3xl font-semibold">Related Projects</h2>
          <div class="grid gap-8 sm:grid-cols-2">
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
                    format="webp"
                    sizes="sm:100vw, md:320px"
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

// Horizontal scroll items (photos only)
const horizontalScrollItems = computed(() => {
  if (!project.value) return []

  return project.value.processedPhotos.map((photo) => ({
    id: photo.id,
    type: 'photo',
    photo,
  }))
})

// SEO
useHead({
  title: () => (project.value ? `${project.value.title} - Projects` : 'Project'),
})

useSeoMeta({
  title: () => (project.value ? `${project.value.title} - Projects` : 'Project'),
  description: () => project.value?.description || 'Photography project',
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
