<script setup lang="ts">
import ContactCTA from '~/components/ContactCTA.vue'

useSeoMeta({
  title: 'Prints | Photography Portfolio',
  description: 'Purchase physical or digital prints of my photography works.',
})
</script>

<template>
  <div class="container mx-auto px-4 pt-24">
    <h1 class="mb-8 text-4xl font-bold">Prints</h1>

    <!-- Under Construction Section -->
    <div class="flex min-h-[50vh] flex-col items-center justify-center">
      <div class="mb-8 text-8xl">
        <Icon name="ph:hard-hat" />
      </div>
      <h2 class="mb-4 text-center text-2xl font-semibold">Under Construction</h2>
      <p class="mx-auto max-w-2xl text-center text-lg">
        I'm currently working on implementing an online print shop where you'll be able to purchase physical and digital prints of my photography. This feature is coming soon!
      </p>
      <p class="mx-auto mt-4 max-w-2xl text-center text-lg">
        In the meantime, if you're interested in purchasing a print of any of my photos, please don't hesitate to reach out using the contact form below.
      </p>
    </div>

    <!-- Contact CTA -->
    <ContactCTA
      title="Interested in a print?"
      description="Contact me directly to discuss print options, sizes, pricing, and delivery. I offer both physical prints and digital downloads of my work."
      button-text="Get in Touch"
      variant="compact"
    />
  </div>
</template>
