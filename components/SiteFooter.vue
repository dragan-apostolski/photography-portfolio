<template>
  <footer
    class="mt-12 w-full border-t border-secondary-200 py-8 transition-colors duration-300 dark:border-secondary-800"
  >
    <div class="container mx-auto px-4">
      <div class="flex flex-col items-center justify-between gap-6 md:flex-row">
        <!-- Copyright and brand -->
        <div class="text-center md:text-left">
          <div class="font-medium">© {{ currentYear }} Dragan Apostolski</div>
          <div class="mt-1 text-sm text-secondary-300 dark:text-secondary-700">
            Photography Portfolio
          </div>
        </div>

        <!-- Social Links -->
        <div class="flex items-center gap-6">
          <!-- Instagram -->
          <a
            href="https://instagram.com/apostolski_dragan"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary transition-colors duration-300 hover:text-accent dark:text-primary-dark"
            aria-label="Instagram"
          >
            <Icon name="mdi:instagram" class="h-6 w-6" />
          </a>

          <!-- Behance -->
          <a
            href="https://www.behance.net/drapostols8377"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary transition-colors duration-300 hover:text-accent dark:text-primary-dark"
            aria-label="Behance"
          >
            <Icon name="mdi:behance" class="h-6 w-6" />
          </a>

          <!-- Portfolio -->
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary transition-colors duration-300 hover:text-accent dark:text-primary-dark"
            aria-label="Dev Portfolio"
          >
            <Icon name="mdi:web" class="h-6 w-6" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Get current year for copyright
const currentYear = new Date().getFullYear()
</script>
