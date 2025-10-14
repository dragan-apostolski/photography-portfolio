<script setup lang="ts">
interface ContactFormData {
  email: string
  message: string
}

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const formData = ref<ContactFormData>({
  email: '',
  message: '',
})

const isSubmitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref('')
const showCharacterError = ref(false)
let debounceTimer: NodeJS.Timeout | null = null

const isFormValid = computed(() => {
  const email = formData.value.email.trim()
  const message = formData.value.message.trim()
  
  const emailValid = email.length > 0 && isValidEmail(email)
  const messageValid = message.length >= 10
  
  return emailValid && messageValid
})

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const handleClose = () => {
  if (!isSubmitting.value) {
    emit('close')
    // Clear debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    // Reset form after animation completes
    setTimeout(() => {
      formData.value = { email: '', message: '' }
      submitSuccess.value = false
      submitError.value = ''
      showCharacterError.value = false
    }, 300)
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return

  isSubmitting.value = true
  submitError.value = ''

  try {
    const response = await $fetch('/api/contact', {
      method: 'POST',
      body: formData.value,
    })

    submitSuccess.value = true
    formData.value = { email: '', message: '' }

    // Close form after 2 seconds
    setTimeout(() => {
      handleClose()
    }, 2000)
  } catch (error: any) {
    submitError.value = error.data?.message || 'Failed to send message. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

// Debounced character count error
const checkCharacterCount = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  debounceTimer = setTimeout(() => {
    if (formData.value.message.length > 0 && formData.value.message.length < 10) {
      showCharacterError.value = true
    } else {
      showCharacterError.value = false
    }
  }, 2000) // Show error after 2 seconds of no typing
}

// Watch message changes for debounced error display
watch(() => formData.value.message, (newValue) => {
  // Clear any existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  
  // If message is empty or meets requirement, hide error immediately
  if (newValue.length === 0 || newValue.length >= 10) {
    showCharacterError.value = false
    return
  }
  
  // If message is below 10 characters, hide error while typing but start debounce timer
  showCharacterError.value = false
  checkCharacterCount()
})

// Close on Escape key
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    handleClose()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>

<template>
  <!-- Backdrop -->
  <Transition
    enter-active-class="transition-opacity duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      @click="handleClose"
    />
  </Transition>

  <!-- Modal -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-2xl p-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2"
    >
      <div
        class="relative rounded-t-2xl bg-white p-6 shadow-2xl dark:bg-secondary-800 md:rounded-2xl md:p-8"
        @click.stop
      >
        <!-- Close Button -->
        <button
          type="button"
          class="absolute right-4 top-4 cursor-pointer rounded-full p-2 text-secondary-600 transition-colors hover:bg-secondary-100 hover:text-secondary-800 dark:text-secondary-300 dark:hover:bg-secondary-700 dark:hover:text-secondary-100"
          :disabled="isSubmitting"
          @click="handleClose"
        >
          <Icon name="heroicons:x-mark" class="h-6 w-6" />
        </button>

        <!-- Success State -->
        <div v-if="submitSuccess" class="py-8 text-center">
          <div class="mb-4 flex justify-center">
            <div
              class="rounded-full bg-green-100 p-3 dark:bg-green-900/30"
            >
              <Icon name="heroicons:check-circle" class="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 class="mb-2 text-2xl font-semibold text-secondary-900 dark:text-secondary-100">Message Sent!</h3>
          <p class="text-secondary-700 dark:text-secondary-300">Thank you for reaching out. I'll get back to you soon.</p>
        </div>

        <!-- Form -->
        <form v-else @submit.prevent="handleSubmit">
          <h2 class="mb-2 text-2xl font-bold text-secondary-900 md:text-3xl dark:text-secondary-100">Get in Touch</h2>
          <p class="mb-6 text-secondary-700 dark:text-secondary-300">
            Fill out the form below and I'll get back to you as soon as possible.
          </p>

          <!-- Email Field -->
          <div class="mb-4">
            <label for="email" class="mb-2 block text-sm font-medium text-secondary-800 dark:text-secondary-200">
              Your Email <span class="text-red-500">*</span>
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              class="w-full rounded-lg border border-secondary-300 bg-white px-4 py-3 text-secondary-900 transition-colors placeholder:text-secondary-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-secondary-600 dark:bg-secondary-700 dark:text-secondary-100 dark:placeholder:text-secondary-400"
              placeholder="your.email@example.com"
              :disabled="isSubmitting"
            />
            <p
              v-if="formData.email && !isValidEmail(formData.email)"
              class="mt-1 text-sm text-red-500"
            >
              Please enter a valid email address
            </p>
          </div>

          <!-- Message Field -->
          <div class="mb-6">
            <label for="message" class="mb-2 block text-sm font-medium text-secondary-800 dark:text-secondary-200">
              What are you interested in? <span class="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              v-model="formData.message"
              required
              rows="6"
              class="w-full rounded-lg border border-secondary-300 bg-white px-4 py-3 text-secondary-900 transition-colors placeholder:text-secondary-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-secondary-600 dark:bg-secondary-700 dark:text-secondary-100 dark:placeholder:text-secondary-400"
              placeholder="Tell me about your project, event, or any questions you have..."
              :disabled="isSubmitting"
            />
            <p 
              v-if="formData.message.length < 10" 
              class="mt-1 text-sm text-secondary-600 dark:text-secondary-400"
            >
              {{ formData.message.length }}/10 characters minimum
            </p>
            <p v-if="showCharacterError" class="mt-1 text-sm text-red-500">
              Message must be at least 10 characters long
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="submitError" class="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {{ submitError }}
          </div>

          <!-- Submit Button -->
          <div class="flex gap-3">
            <button
              type="button"
              class="cursor-pointer rounded-lg border border-secondary-300 px-6 py-3 font-medium text-secondary-700 transition-colors hover:bg-secondary-100 hover:text-secondary-900 dark:border-secondary-600 dark:text-secondary-300 dark:hover:bg-secondary-700 dark:hover:text-secondary-100"
              :disabled="isSubmitting"
              @click="handleClose"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 rounded-lg px-6 py-3 font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
              :class="
                isFormValid
                  ? 'cursor-pointer bg-accent text-white hover:bg-accent/90'
                  : 'cursor-not-allowed bg-secondary-300 text-secondary-600 dark:bg-secondary-700 dark:text-secondary-400'
              "
              :disabled="!isFormValid || isSubmitting"
            >
              <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                <Icon name="heroicons:arrow-path" class="h-5 w-5 animate-spin" />
                Sending...
              </span>
              <span v-else>Send Message</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

