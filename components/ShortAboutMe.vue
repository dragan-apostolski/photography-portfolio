<script setup lang="ts">
import Button from '~/components/ui/Button.vue'

const router = useRouter()

const navigateToAbout = () => {
  router.push('/about')
}

// Get photo URL helper
const { getPhotoUrl } = useProjects()
const aboutPhotoUrl = getPhotoUrl('/photos/Other/SelfPortraitCropped.jpg')
</script>

<template>
  <section class="border-t border-secondary-200 px-4 py-24 transition-colors duration-300 dark:border-secondary-800 md:px-8 md:py-32 lg:px-16 lg:py-40">
    <div class="container mx-auto">
      <div
        class="flex flex-col space-y-12 md:flex-row md:items-center md:space-y-0 md:space-x-16 lg:space-x-24"
      >
        <!-- Text Column -->
        <div class="md:w-1/2">
          <h2 class="mb-4 text-3xl font-semibold tracking-tight">About Me</h2>
          <div class="mb-6 text-lg leading-relaxed">
            <p class="mb-4">
              I'm a landscape & travel photographer with a passion for capturing the natural beauty
              of our world. My work focuses on stunning landscapes, artistic portraits, and
              meaningful moments from everyday life.
            </p>
            <p>
              My photography style combines dramatic natural lighting with thoughtful composition to
              create images that evoke emotion and tell stories about our connection to nature and
              each other.
            </p>
          </div>
          <Button @click="navigateToAbout">Read more</Button>
        </div>

        <!-- Image Column -->
        <div class="flex justify-center md:w-1/2">
          <div
            class="relative h-96 w-80 overflow-hidden rounded-2xl shadow-lg lg:h-[500px] lg:w-[400px]"
          >
            <NuxtImg
              :src="aboutPhotoUrl"
              alt="Portrait photo"
              class="h-full w-full object-cover transition-all duration-300 hover:scale-[1.03]"
              sizes="80vw md:400px"
            />
            <div
              class="absolute inset-0 rounded-2xl ring-1 ring-secondary-300 dark:ring-secondary-700"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
