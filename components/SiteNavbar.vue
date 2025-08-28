<template>
  <nav
    class="fixed top-0 right-0 left-0 z-50 bg-transparent backdrop-blur-xl transition-all duration-300"
    :class="{
      'bg-primary/80 shadow-md backdrop-blur-sm dark:bg-primary-dark/80': scrolled,
    }"
  >
    <!-- Desktop Navigation -->
    <div class="container mx-auto hidden h-16 items-center justify-between px-4 md:flex">
      <!-- Logo/Brand -->
      <div class="flex-shrink-0">
        <nuxt-link to="/" class="text-xl font-bold uppercase transition-colors duration-300">
          Apostolski
        </nuxt-link>
      </div>

      <!-- Navigation Links -->
      <div class="flex flex-1 items-center justify-center px-4">
        <ul class="flex space-x-8">
          <li v-for="item in menuItems" :key="item.path">
            <nuxt-link
              :to="item.path"
              class="relative font-medium transition-colors duration-300 hover:text-accent"
              :class="{ 'text-accent': isActiveRoute(item.path) }"
            >
              {{ item.name }}
            </nuxt-link>
          </li>
        </ul>
      </div>

      <!-- Dark Mode Toggle -->
      <button
        aria-label="Toggle dark mode"
        class="flex cursor-pointer items-center justify-center rounded-full p-2 transition-all duration-300 hover:bg-accent hover:text-primary dark:hover:text-primary-dark"
        @click="toggleColorMode"
      >
        <span v-if="isDark" class="flex items-center justify-center text-xl">
          <Icon name="ph:sun" />
        </span>
        <span v-else class="flex items-center justify-center text-xl">
          <Icon name="ph:moon" />
        </span>
      </button>
    </div>

    <!-- Mobile Navigation -->
    <div class="container mx-auto flex h-16 items-center justify-between px-4 md:hidden">
      <!-- Brand Name -->
      <div class="flex-shrink-0">
        <nuxt-link to="/" class="text-lg font-bold uppercase transition-colors duration-300">
          Apostolski
        </nuxt-link>
      </div>
      <div class="flex items-center space-x-3">
        <!-- Color Mode Toggle -->
        <button
          aria-label="Toggle dark mode"
          class="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-accent hover:text-primary dark:hover:text-primary-dark"
          @click="toggleColorMode"
        >
          <span v-if="isDark" class="flex items-center justify-center text-xl">
            <Icon name="ph:sun" />
          </span>
          <span v-else class="flex items-center justify-center text-xl">
            <Icon name="ph:moon" />
          </span>
        </button>
        <!-- Menu Toggle Button -->
        <button
          aria-label="Toggle menu"
          class="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:text-accent"
          @click="toggleMenu"
        >
          <div class="relative h-5 w-6">
            <span
              class="absolute block h-[2px] w-6 rounded-full transition-all duration-300"
              :class="{
                'bg-accent': !isMenuOpen,
                'top-2 rotate-45 bg-accent': isMenuOpen,
              }"
              :style="{ top: '0px' }"
            />
            <span
              class="absolute block h-[2px] w-6 rounded-full transition-all duration-300"
              :class="{
                'bg-accent': !isMenuOpen,
                'opacity-0': isMenuOpen,
              }"
              :style="{ top: '8px' }"
            />
            <span
              class="absolute block h-[2px] w-6 rounded-full transition-all duration-300"
              :class="{
                'bg-accent': !isMenuOpen,
                'top-2 -rotate-45 bg-accent': isMenuOpen,
              }"
              :style="{ top: '16px' }"
            />
          </div>
        </button>
      </div>
    </div>

    <!-- Mobile Menu (Fullscreen) -->
    <div
      v-if="isMenuOpen"
      class="fixed inset-0 z-40 flex flex-col transition-all duration-300 ease-in-out"
      :class="{
        'translate-y-0 opacity-100': isMenuOpen,
        '-translate-y-full opacity-0': !isMenuOpen,
        'bg-primary': !isDark,
        'bg-primary-dark': isDark,
      }"
    >
      <!-- Top navigation bar with brand -->
      <div class="flex items-center justify-between px-4 pt-6">
        <h2 class="text-2xl font-bold tracking-wider uppercase">Apostolski</h2>
        <div class="flex items-center space-x-3">
          <!-- Dark Mode Toggle -->
          <button
            aria-label="Toggle dark mode"
            class="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-accent hover:text-primary dark:hover:text-primary-dark"
            @click="toggleColorMode"
          >
            <span v-if="isDark" class="flex items-center justify-center text-xl">
              <Icon name="ph:sun" />
            </span>
            <span v-else class="flex items-center justify-center text-xl">
              <Icon name="ph:moon" />
            </span>
          </button>
          <!-- Menu Toggle Button -->
          <button
            aria-label="Toggle menu"
            class="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-accent hover:text-primary dark:hover:text-primary-dark"
            @click="closeMenu"
          >
            <div class="relative h-5 w-5">
              <span
                class="absolute top-2 block h-[2px] w-5 rotate-45 rounded-full bg-accent transition-all duration-300"
              />
              <span
                class="absolute block h-[2px] w-5 rounded-full opacity-0 transition-all duration-300"
                :style="{ top: '8px' }"
              />
              <span
                class="absolute top-2 block h-[2px] w-5 -rotate-45 rounded-full bg-accent transition-all duration-300"
                :style="{ top: '16px' }"
              />
            </div>
          </button>
        </div>
      </div>

      <!-- Menu Items in center -->
      <div class="flex flex-1 flex-col items-center justify-center">
        <ul class="flex flex-col space-y-6 text-center">
          <li v-for="item in menuItems" :key="item.path">
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

      <!-- Bottom Spacing -->
      <div class="pb-12" />
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const colorMode = useColorMode()

// Reactive state
const scrolled = ref(false)
const isMenuOpen = ref(false)
const isDark = computed(() => colorMode.value === 'dark')

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
