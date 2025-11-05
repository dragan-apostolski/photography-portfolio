import * as Sentry from '@sentry/nuxt'

Sentry.init({
  dsn: useRuntimeConfig().public.sentryDsn,
  debug: true,
  environment: process.env.NODE_ENV || 'production',
  tracesSampleRate: 1.0,
})



