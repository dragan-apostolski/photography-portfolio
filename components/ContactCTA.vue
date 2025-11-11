<script setup lang="ts">
import Button from './ui/Button.vue'
import ContactForm from './ContactForm.vue'

interface Props {
  title?: string
  description?: string
  buttonText?: string
  variant?: 'default' | 'compact'
}

const props = withDefaults(defineProps<Props>(), {
  title: "Interested in working together?",
  description: "Let's discuss how I can help you with your photography needs. Get in touch to discuss rates, availability, and custom packages.",
  buttonText: 'Contact Me',
  variant: 'default',
})

// Contact form state
const isContactFormOpen = ref(false)

const openContactForm = () => {
  isContactFormOpen.value = true
}

const closeContactForm = () => {
  isContactFormOpen.value = false
}

const sectionClasses = computed(() => {
  if (props.variant === 'compact') {
    return 'mt-16 rounded-lg bg-secondary-100 p-8 text-center dark:bg-secondary-900'
  }
  return 'border-t border-secondary-200 px-4 py-24 transition-colors duration-300 dark:border-secondary-800 md:px-8 md:py-32 lg:px-16 lg:py-40'
})

const containerClasses = computed(() => {
  if (props.variant === 'compact') {
    return ''
  }
  return 'container mx-auto'
})

const ctaClasses = computed(() => {
  if (props.variant === 'compact') {
    return ''
  }
  return 'rounded-lg bg-secondary-100 p-8 text-center dark:bg-secondary-900 md:p-12'
})
</script>

<template>
  <section :class="sectionClasses">
    <div :class="containerClasses">
      <div :class="ctaClasses">
        <h2 class="mb-4 text-2xl font-semibold md:text-3xl">{{ props.title }}</h2>
        <p class="mx-auto mb-6 max-w-2xl text-lg">
          {{ props.description }}
        </p>
        <Button @click="openContactForm">{{ props.buttonText }}</Button>
      </div>
    </div>

    <!-- Contact Form Modal -->
    <ContactForm :is-open="isContactFormOpen" @close="closeContactForm" />
  </section>
</template>

