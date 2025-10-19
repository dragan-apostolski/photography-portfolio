<template>
  <nav
    class="fixed top-0 right-0 left-0 z-50 bg-transparent backdrop-blur-3xl transition-all duration-300"
    :class="{
      'bg-primary/80 shadow-md backdrop-blur-sm dark:bg-primary-dark/80': scrolled,
    }"
  >
    <!-- Unified Navigation Container -->
    <div
      class="container mx-auto flex flex-col overflow-hidden transition-all duration-300 md:h-16 md:flex-row md:items-center md:justify-between md:px-4"
      :class="{
        'h-16': !isMenuOpen,
        'h-screen': isMenuOpen,
      }"
    >
      <!-- Header Bar (always visible) -->
      <div class="flex h-16 flex-shrink-0 items-center justify-between px-4 md:w-full md:px-0">
        <!-- Brand/Logo (shared) -->
        <div class="flex-shrink-0">
          <nuxt-link
            to="/"
            class="text-lg font-bold uppercase transition-colors duration-300 md:text-xl"
          >
            Apostolski
          </nuxt-link>
        </div>

        <!-- Desktop Navigation Links -->
        <div class="hidden flex-1 items-center justify-center px-4 md:flex">
          <ul class="flex space-x-8">
            <li v-for="item in menuItems" :key="`desktop-${item.path}`">
              <nuxt-link
                :to="item.path"
                class="relative font-medium transition-colors duration-300 hover:text-accent lg:text-lg"
                :class="{ 'text-accent': isActiveRoute(item.path) }"
              >
                {{ item.name }}
              </nuxt-link>
            </li>
          </ul>
        </div>

        <!-- Right Side Controls -->
        <div class="flex items-center space-x-3">
          <!-- Color Mode Toggle (shared) -->
          <button
            aria-label="Toggle dark mode"
            class="cursor-pointer flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-accent hover:text-primary md:h-auto md:w-auto md:p-2 dark:hover:text-primary-dark"
            @click="toggleColorMode"
          >
            <span class="flex items-center justify-center text-xl">
              <Icon :name="colorMode.value === 'dark' ? 'ph:moon' : 'ph:sun'" />
            </span>
          </button>

          <!-- Mobile Menu Toggle (mobile only) -->
          <button
            aria-label="Toggle menu"
            class="cursor-pointer flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:text-accent md:hidden"
            @click="toggleMenu"
          >
            <div class="relative h-5 w-6">
              <span
                class="absolute block h-[2px] w-6 rounded-full bg-accent transition-all duration-300"
                :class="{
                  'top-0 rotate-0': !isMenuOpen,
                  'top-2 rotate-45': isMenuOpen,
                }"
              />
              <span
                class="absolute top-2 block h-[2px] w-6 rounded-full bg-accent transition-all duration-300"
                :class="{
                  'opacity-100': !isMenuOpen,
                  'opacity-0': isMenuOpen,
                }"
              />
              <span
                class="absolute block h-[2px] w-6 rounded-full bg-accent transition-all duration-300"
                :class="{
                  'top-4 rotate-0': !isMenuOpen,
                  'top-2 -rotate-45': isMenuOpen,
                }"
              />
            </div>
          </button>
        </div>
      </div>

      <!-- Mobile Menu Items (mobile only, slides down from header) -->
      <div
        class="flex flex-1 flex-col items-center justify-center px-4 transition-all duration-300 md:hidden"
        :class="{
          'translate-y-0 opacity-100': isMenuOpen,
          'pointer-events-none -translate-y-4 opacity-0': !isMenuOpen,
        }"
      >
        <ul class="flex flex-col space-y-6 text-center">
          <li v-for="item in menuItems" :key="`mobile-${item.path}`">
            <nuxt-link
              :to="item.path"
              class="text-xl font-medium tracking-wide transition-all duration-300 hover:translate-y-[-2px] hover:text-accent"
              :class="{ 'font-semibold text-accent': isActiveRoute(item.path) }"
              @click="closeMenu"
            >
              {{ item.name }}
            </nuxt-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const colorMode = useColorMode()

// Reactive state
const scrolled = ref(false)
const isMenuOpen = ref(false)

// Menu items
const menuItems = [
  { name: 'Home', path: '/' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Projects', path: '/projects' },
  { name: 'Prints', path: '/prints' },
  { name: 'Services', path: '/services' },
  { name: 'About', path: '/about' },
]

// Methods
const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  if (isMenuOpen.value) {
    document.body.style.overflow = 'hidden' // Prevent scrolling when menu is open
  } else {
    document.body.style.overflow = '' // Allow scrolling when menu is closed
  }
}

const closeMenu = () => {
  isMenuOpen.value = false
  document.body.style.overflow = ''
}

const isActiveRoute = (path: string): boolean => {
  if (path === '/') {
    return route.path === path
  }
  return route.path.startsWith(path)
}

// Watch for scroll to add background to navbar
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}
</script>
