<script setup lang="ts">
import ContactCTA from '~/components/ContactCTA.vue'

useSeoMeta({
  title: 'About Me | Photography Portfolio',
  description: 'Learn more about me as a landscape, travel, and portrait photographer.',
})

// Get photo URL helper
const { getPhotoUrl } = useProjects()
const aboutPhotoUrl1 = getPhotoUrl('/photos/Other/Meditating.jpg')
const aboutPhotoUrl2 = getPhotoUrl('/photos/Other/SelfPortraitCropped.jpg')
const aboutPhotoUrl3 = getPhotoUrl('/photos/Projects/The Red Stairs/DSC00114.jpg')
</script>

<template>
  <div class="container mx-auto px-4 py-12 pt-24">
    <h1 class="mb-8 text-4xl font-bold">About Me</h1>

    <!-- Three Photos Horizontal Layout -->
    <div class="mb-16 flex items-center justify-center gap-6">
      <!-- Left Photo - Hidden on mobile -->
      <div class="hidden w-64 overflow-hidden rounded-lg md:block">
        <NuxtImg
          :src="aboutPhotoUrl1"
          alt="Portrait photo 1"
          class="h-full w-full object-cover transition-all duration-300 hover:scale-[1.03]"
          sizes="256px"
          quality="80"
          placeholder
          loading="lazy"
        />
      </div>

      <!-- Center Photo - Visible on all screens -->
      <div class="w-full max-w-md overflow-hidden rounded-lg md:w-80">
        <NuxtImg
          :src="aboutPhotoUrl2"
          alt="Portrait photo"
          class="h-full w-full object-cover transition-all duration-300 hover:scale-[1.03]"
          sizes="100vw md:320px"
          quality="80"
          placeholder
          loading="lazy"
        />
      </div>

      <!-- Right Photo - Hidden on mobile -->
      <div class="hidden w-64 overflow-hidden rounded-lg md:block">
        <NuxtImg
          :src="aboutPhotoUrl3"
          alt="Portrait photo 3"
          class="h-full w-full object-cover transition-all duration-300 hover:scale-[1.03]"
          sizes="256px"
          quality="80"
          placeholder
          loading="lazy"
        />
      </div>
    </div>

    <!-- Bio Section -->
    <div class="mx-auto max-w-3xl">
      <h2 class="mb-8 text-center text-2xl font-semibold">Dragan Apostolski</h2>

      <p class="mb-4">
        I am a landscape & travel photographer, with a passion for capturing the beauty of nature, and inspiring moments from my journeys and everyday life.
         My style encompasses stunning landscapes from beautiful locations, artistic portraits, and candid moments from everyday life.
      </p>

      <p class="mb-4">
        My journey in photography began in the childhood days, when I started playing with my father's analog Zenit 12 camera. 
        Since it was a film camera, I was always taught to take my time and compose the photo carefully before shooting, because there is a limited number of shots on a film.
        I then continued playing with my uncle's digital camera, when he started taking me along on hiking trips in the local Šar Mountains in Macedonia. 
        I started discovering the mesmerizing beauty of nature, and I wanted to capture these moments so that I could show them to my friends and family.
        I then discovered my passion for photography, and I soon got my first DSLR camera, the Nikon D3100, which just opened a whole new world for me.
      </p>

      <p class="mb-4">
        Today, I still have the same passion for photography, and I cannot imagine going on a travel or hiking trip without my camera. 
        Going out into the world and exploring is still something that is my main driver, and the way I present what I see is something unique to me, I believe. 
        Well, it is in fact unique to each and everyone of us. 
      </p>

      <p class="mb-4">
        I strive to create images that evoke emotion and tell a story. Whether it's the grandeur
        of a mountain range, the intimacy of a portrait, or the spontaneity of street photography,
        I aim to capture authentic moments that resonate with viewers.
      </p>
    </div>

    <!-- Equipment Section -->
    <div class="hidden mt-16">
      <h2 class="mb-6 text-2xl font-semibold">Equipment</h2>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-lg bg-secondary-100 p-6 dark:bg-secondary-900">
          <h3 class="mb-3 text-xl font-semibold">Cameras</h3>
          <ul class="list-inside list-disc space-y-2">
            <li>Sony Alpha A7 IV</li>
            <li>Sony Alpha A6600</li>
          </ul>
        </div>

        <div class="rounded-lg bg-secondary-100 p-6 dark:bg-secondary-900">
          <h3 class="mb-3 text-xl font-semibold">Lenses</h3>
          <ul class="list-inside list-disc space-y-2">
            <li>Sony 16-35mm f/2.8 GM</li>
            <li>Sony 24-70mm f/2.8 GM</li>
            <li>Sony 70-200mm f/2.8 GM</li>
            <li>Sony 85mm f/1.4 GM</li>
          </ul>
        </div>

        <div class="rounded-lg bg-secondary-100 p-6 dark:bg-secondary-900">
          <h3 class="mb-3 text-xl font-semibold">Accessories</h3>
          <ul class="list-inside list-disc space-y-2">
            <li>Gitzo Traveler Tripod</li>
            <li>Lee Filter System</li>
            <li>DJI Mavic Air 2 Drone</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Contact Section -->
    <ContactCTA
      variant="compact"
      title="Get In Touch"
      description="If you'd like to work with me or have any questions about my work, please don't hesitate to reach out. I'm always looking for new projects and collaborations."
      button-text="Contact me"
    />
  </div>
</template>
