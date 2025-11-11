<script setup lang="ts">
import Button from './ui/Button.vue'

const router = useRouter()

const navigateToServices = () => {
  router.push('/services')
}

// Get photo URL helper
const { getPhotoUrl } = useProjects()

const services = [
  {
    title: 'Hospitality',
    description: 'Content for camps, resorts, and accommodations',
    imageUrl: getPhotoUrl('/photos/Projects/Eco Camp Rincica/DSC02308.jpg'),
  },
  {
    title: 'Portraits',
    description: 'Artistic and casual portrait photography',
    imageUrl: getPhotoUrl('/photos/Projects/The Red Stairs/DSC00085.jpg'),
  },
  {
    title: 'Events',
    description: 'Comprehensive event and celebration coverage',
    imageUrl: getPhotoUrl('/photos/Projects/Electronic Brunch/DSC09448.jpg'),
  },
]
</script>

<template>
  <section class="border-t border-secondary-200 px-4 py-24 transition-colors duration-300 dark:border-secondary-800 md:px-8 md:py-32 lg:px-16 lg:py-40">
    <div class="container mx-auto">
      <div class="mb-12 text-center">
        <h2 class="mb-4 text-3xl font-semibold tracking-tight">Services</h2>
        <p class="mx-auto max-w-2xl text-lg leading-relaxed">
          I offer a range of photography services tailored to your needs. From hospitality content
          to portraits and events, I can help you capture those special moments.
        </p>
      </div>

      <!-- Services Photos - One column on mobile, one row on desktop -->
      <div class="mb-12 flex flex-col gap-6 md:flex-row md:gap-8">
        <div
          v-for="(service, index) in services"
          :key="index"
          class="group flex-1 overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl"
        >
          <div class="relative aspect-[16/9] overflow-hidden">
            <NuxtImg
              :src="service.imageUrl"
              :alt="`${service.title} photography service`"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              :class="{ 'object-top': service.title === 'Portraits' }"
              loading="lazy"
              sizes="100vw md:30vw"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <div
              class="absolute bottom-0 left-0 right-0 p-6 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >
              <h3 class="mb-2 text-2xl font-semibold">{{ service.title }}</h3>
              <p class="text-sm">{{ service.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <Button @click="navigateToServices">Read more</Button>
      </div>
    </div>
  </section>
</template>

