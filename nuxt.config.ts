// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-04-30',
  devtools: { enabled: true },

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/color-mode',
  ],

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
