// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-04-30',
  devtools: { enabled: true },

  // Runtime configuration
  runtimeConfig: {
    public: {
      cdnBaseUrl: process.env.NUXT_PUBLIC_CDN_BASE_URL || '',
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN || '',
    },
  },

  // Vercel deployment configuration
  nitro: {
    preset: 'vercel',
  },

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/color-mode',
    '@sentry/nuxt/module',
  ],

  // Sentry configuration
  sentry: {
    org: 'apostolski',
    project: 'photography-portfolio',
    authToken: process.env.SENTRY_AUTH_TOKEN,
  },

  // Enable source maps for better error stack traces
  sourcemap: {
    client: 'hidden',
  },

  // Image configuration - Vercel Image Optimization
  image: {
    quality: 80,
    format: ['avif', 'webp', 'jpg'],
    domains: ['v1kazbs5j1o30hpf.public.blob.vercel-storage.com'],
    vercel: {
      formats: ['avif', 'webp', 'jpeg']
    },
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
      '2xl': 2048,
    },
  },

  routeRules: {
    // Homepage pre-rendered at build time
    '/': { prerender: true },
    
    // About page pre-rendered at build time  
    '/about': { prerender: true },
    
    // Projects index pre-rendered
    '/projects': { prerender: true },
    
    // Individual project pages with ISR (regenerate every hour)
    '/projects/**': {
      prerender: true,
    },
    
    // Gallery with longer cache
    '/gallery': { 
      prerender: true,
    },
  },

  // Color mode configuration
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
    dataValue: 'theme', // Optional, adds data-theme attribute
  },

  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      autoprefixer: {},
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  // Font configuration
  fonts: {
    families: [
      {
        name: 'Rajdhani',
        weights: [400, 500, 600, 700],
      },
    ],
  },
})
