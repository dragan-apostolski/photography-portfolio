<script setup lang="ts">

import Button from '~/components/ui/Button.vue'

useSeoMeta({
  title: 'About Me | Photography Portfolio',
  description: 'Learn more about me as a landscape, travel, and portrait photographer.',
})
</script>

<template>
  <div class="container mx-auto px-4 py-12 pt-24">
    <h1 class="mb-8 text-4xl font-bold">About Me</h1>

    <div class="grid grid-cols-1 gap-12 md:grid-cols-2">
      <!-- Profile Image Section -->
      <div class="overflow-hidden rounded-lg">
        <NuxtImg
          src="/photos/projects/The Red Stairs/DSC00114.jpg"
          alt="Portrait photo"
          class="h-full w-full object-cover transition-all duration-300 hover:scale-[1.03]"
          format="webp"
          sizes="400px md:350px lg:400px xl:450px"
          quality="80"
          placeholder
          loading="lazy"
        />
      </div>

      <!-- Bio Section -->
      <div>
        <h2 class="mb-4 text-2xl font-semibold">Dragan Apostolski</h2>

        <p class="mb-4">
          I am a landscape & travel photographer, with a passion for capturing the beauty of nature
          and everyday moments. My style encompasses stunning landscapes from beautiful locations,
          artistic portraits, and candid moments from everyday life.
        </p>

        <p class="mb-4">
          My journey in photography began when I first picked up a camera during a trip to the
          mountains. Since then, I've been captivated by the ability to freeze a moment in time and
          share the world as I see it.
        </p>

        <p class="mb-4">
          I strive to create images that evoke emotion and tell a story. Whether it's the grandeur
          of a mountain range, the intimacy of a portrait, or the spontaneity of street photography,
          I aim to capture authentic moments that resonate with viewers.
        </p>

        <h3 class="mt-8 mb-3 text-xl font-semibold">My Approach</h3>
        <p class="mb-4">
          I believe in a minimalist approach to photography, focusing on composition, light, and
          emotion rather than heavy post-processing. I prefer to capture the essence of a scene
          in-camera, using natural light whenever possible.
        </p>
      </div>
    </div>

    <!-- Equipment Section -->
    <div class="mt-16">
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
    <div class="mt-16 rounded-lg bg-secondary-100 p-8 text-center dark:bg-secondary-900">
      <h2 class="mb-4 text-2xl font-semibold">Get In Touch</h2>
      <p class="mx-auto mb-6 max-w-2xl">
        If you'd like to work with me or have any questions about my work, please don't hesitate to
        reach out. I'm always looking for new projects and collaborations.
      </p>
      <Button custom-classes="mt-6">Contact me</Button>

    </div>
  </div>
</template>
