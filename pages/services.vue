<script setup lang="ts">
useSeoMeta({
  title: 'Services | Photography Portfolio',
  description: 'Photography services including accommodations, portraits, and events.',
})

interface Service {
  id: number
  title: string
  description: string
  imageUrl?: string
}

// Services offered
const services = ref<Service[]>([
  {
    id: 1,
    title: 'Accommodations',
    description:
      "Creating content for camps, resorts, airbnb's and other accommodations in nature. Showcase your property with stunning photographs that highlight its unique features and surroundings.",
  },
  {
    id: 2,
    title: 'Portraits',
    description:
      'Professional portrait photography for individuals and groups. Capture your personality and create memories that will last a lifetime.',
  },
  {
    id: 3,
    title: 'Events',
    description:
      "Comprehensive event photography covering conferences, celebrations, corporate events, and more. Don't miss a moment of your special occasion.",
  },
])
</script>

<template>
  <div class="container mx-auto px-4 py-12">
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
        <!-- Image Placeholder -->
        <div class="relative aspect-video bg-secondary-200 dark:bg-secondary-800">
          <div class="absolute inset-0 flex items-center justify-center">
            <p class="text-center font-medium">{{ service.title }} Image</p>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <h3 class="mb-3 text-2xl font-semibold">{{ service.title }}</h3>
          <p>{{ service.description }}</p>

          <button
            class="mt-6 border-2 border-accent bg-transparent px-4 py-2 font-medium tracking-wider uppercase transition-all duration-300 hover:bg-accent hover:text-primary dark:text-primary-dark dark:hover:text-primary-dark"
          >
            Learn More
          </button>
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
      <button
        class="border-2 border-accent bg-transparent px-6 py-3 font-medium tracking-wider uppercase transition-all duration-300 hover:bg-accent hover:text-primary dark:hover:text-primary-dark"
      >
        Contact Me
      </button>
    </div>
  </div>
</template>
