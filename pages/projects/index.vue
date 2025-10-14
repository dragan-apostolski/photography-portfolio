<template>
  <div class="min-h-screen">
    <div class="container mx-auto px-4 py-24">
      <div class="mb-8">
        <h1 class="mb-4 text-4xl font-bold">Projects</h1>
        <p class="text-lg opacity-80">
          A collection of my photography projects, from commercial work to personal artistic
          endeavors.
        </p>
      </div>

      <!-- Filter Tags -->
      <div v-if="availableTags && availableTags.length > 0" class="mb-8">
        <div class="flex flex-wrap gap-2">
          <Tag
            label="All Projects"
            :active="selectedTag === null"
            :on-click="() => selectTag(null)"
          />
          <Tag
            v-for="tag in availableTags"
            :key="tag"
            :label="tag"
            :active="selectedTag === tag"
            :on-click="() => selectTag(tag)"
          />
        </div>
      </div>

      <!-- Projects Grid -->
      <div v-if="pending" class="py-12 text-center">
        <p class="text-lg opacity-60">Loading projects...</p>
      </div>

      <div v-else-if="error" class="py-12 text-center">
        <p class="text-lg text-red-500">Error loading projects: {{ error }}</p>
      </div>

      <div v-else-if="filteredProjects.length === 0" class="py-12 text-center">
        <p class="text-lg opacity-60">No projects found.</p>
      </div>

      <div v-else class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="project in filteredProjects"
          :key="project.slug"
          class="group cursor-pointer"
        >
          <NuxtLink :to="`/projects/${project.slug}`" class="block">
            <!-- Project Cover Image -->
            <div
              class="mb-4 aspect-[4/3] overflow-hidden rounded-lg bg-secondary-200 dark:bg-secondary-800"
            >
              <NuxtImg
                v-if="project.coverPhoto"
                :src="project.coverPhoto"
                :alt="project.title"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                sizes="100vw md:50vw, lg:33vw"
              />
              <div
                v-else
                class="dark:text-secondary-600 flex h-full w-full items-center justify-center text-secondary-300"
              >
                <Icon name="heroicons:photo" class="h-12 w-12" />
              </div>
            </div>

            <!-- Project Info -->
            <div class="space-y-2">
              <h2 class="text-xl font-semibold transition-colors group-hover:text-accent">
                {{ project.title }}
              </h2>
              <p class="line-clamp-2 text-sm opacity-70">
                {{ project.description }}
              </p>
              <div class="flex items-center justify-between text-sm opacity-60">
                <span v-if="project.location">{{ project.location }}</span>
                <time :datetime="project.date">{{ formatDate(project.date) }}</time>
              </div>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="tag in project.tags"
                  :key="tag"
                  class="rounded-full bg-secondary-200 px-2 py-1 text-xs capitalize dark:bg-secondary-800"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/types/project'
import Tag from '~/components/ui/Tag.vue'

// SEO
useHead({
  title: 'Projects - Photography Portfolio',
})

useSeoMeta({
  title: 'Projects - Photography Portfolio',
  description:
    'Explore my photography projects including commercial work, weddings, portraits, and artistic endeavors.',
})

// Get route and router
const route = useRoute()
const router = useRouter()

// State - initialize from query parameter if present
const selectedTag = ref<string | null>((route.query.tag as string) || null)

// Composables
const { getAllProjects, getProjectTags } = useProjects()

// Data fetching
const { data: projects, pending, error } = await useAsyncData('projects', getAllProjects)
const { data: availableTags } = await useAsyncData('project-tags', getProjectTags, {
  default: () => [],
})

// Computed
const filteredProjects = computed((): Project[] => {
  if (!projects.value) return []
  if (!selectedTag.value) return projects.value
  return projects.value.filter((project) => project.tags?.includes(selectedTag.value!))
})

// Tag selection handler
const selectTag = (tag: string | null) => {
  selectedTag.value = tag
  // Update URL query parameter
  router.push({
    query: tag ? { tag } : {},
  })
}

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
