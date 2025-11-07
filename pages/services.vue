<script setup lang="ts">
import Button from '~/components/ui/Button.vue'
import ContactForm from '~/components/ContactForm.vue'

useSeoMeta({
  title: 'Services | Photography Portfolio',
  description: 'Photography services including accommodations, portraits, and events.',
})

// Get photo URL helper
const { getPhotoUrl } = useProjects()

// Contact form state
const isContactFormOpen = ref(false)

const openContactForm = () => {
  isContactFormOpen.value = true
}

const closeContactForm = () => {
  isContactFormOpen.value = false
}

interface Service {
  id: number
  title: string
  description: string
  imageUrl: string
  buttonText: string
  link: string
}

// Services offered
const services = ref<Service[]>([
  {
    id: 1,
    title: 'Hospitality',
    description:
      "Creating content for camps, resorts, airbnb's and other accommodations in nature. Showcase your property with stunning photographs that highlight its unique features and surroundings.",
    imageUrl: getPhotoUrl('/photos/Projects/Eco Camp Rincica/DSC02308.jpg'),
    buttonText: 'See Hospitality Projects',
    link: '/projects?tag=hospitality',
  },
  {
    id: 2,
    title: 'Portraits',
    description:
      'Professional portrait photography for individuals and groups. Capture your personality and create memories that will last a lifetime.',
    imageUrl: getPhotoUrl('/photos/Projects/The Red Stairs/DSC00085.jpg'),
    buttonText: 'See Portrait Projects',
    link: '/projects?tag=portrait',
  },
  {
    id: 3,
    title: 'Events',
    description:
      "Comprehensive event photography covering conferences, celebrations, corporate events, and more. Don't miss a moment of your special occasion.",
    imageUrl: getPhotoUrl('/photos/Projects/Electronic Brunch/DSC09448.jpg'),
    buttonText: 'See Event Projects',
    link: '/projects?tag=event',
  },
])
</script>

<template>
  <div class="container mx-auto px-4 py-12 pt-24">
    <h1 class="mb-8 text-4xl font-bold">Services</h1>

    <p class="mb-12 max-w-3xl text-lg">
      I offer a range of photography services tailored to your needs. Whether you need content for
      your accommodation business, professional portraits, or event coverage, I can help you capture
      those special moments.
    </p>

    <!-- Services Grid -->
    <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="service in services"
        :key="service.id"
        class="overflow-hidden rounded-lg bg-secondary-100 shadow-md transition-all duration-300 hover:shadow-xl dark:bg-secondary-900"
      >
        <!-- Service Image -->
        <div class="relative aspect-video overflow-hidden">
          <NuxtImg
            :src="service.imageUrl"
            :alt="`${service.title} photography service`"
            class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            :class="{ 'object-top': service.title === 'Portraits' }"
            loading="lazy"
            sizes="sm:100vw md:50vw lg:33vw"
          />
        </div>

        <!-- Content -->
        <div class="p-6">
          <h3 class="mb-3 text-2xl font-semibold">{{ service.title }}</h3>
          <p>{{ service.description }}</p>

          <NuxtLink :to="service.link" class="flex justify-center">
            <Button custom-classes="mt-6 w-full lg:w-auto lg:!px-4 lg:!py-2 lg:!text-base">
              {{ service.buttonText }}
            </Button>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Contact CTA -->
    <div class="mt-16 rounded-lg bg-secondary-100 p-8 text-center dark:bg-secondary-900">
      <h2 class="mb-4 text-2xl font-semibold">Interested in working together?</h2>
      <p class="mx-auto mb-6 max-w-2xl">
        Let's discuss how I can help you with your photography needs. Get in touch to discuss rates,
        availability, and custom packages.
      </p>
      <Button @click="openContactForm">Contact Me</Button>
    </div>

    <!-- Contact Form Modal -->
    <ContactForm :is-open="isContactFormOpen" @close="closeContactForm" />
  </div>
</template>
