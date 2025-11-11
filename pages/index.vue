<script setup lang="ts">
import ServicesPreview from '~/components/ServicesPreview.vue'
import ContactCTA from '~/components/ContactCTA.vue'

useSeoMeta({
  title: 'Dragan Apostolski Photography',
  description:
    'Professional photography portfolio showcasing creative vision and technical expertise.',
})
</script>

<template>
  <main>
    <HeroSection />
    <ShortAboutMe />
    <ServicesPreview />
    <GalleryPreview />
    <ContactCTA />
  </main>
</template>
