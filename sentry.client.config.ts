import * as Sentry from '@sentry/nuxt'

Sentry.init({
  dsn: useRuntimeConfig().public.sentryDsn,
  environment: process.env.NODE_ENV || 'production',
  tracesSampleRate: 1.0,
  tunnel: '/api/tunnel',
})



