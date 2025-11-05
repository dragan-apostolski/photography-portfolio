import * as Sentry from '@sentry/nuxt'

Sentry.init({
  dsn: process.env.NUXT_PUBLIC_SENTRY_DSN,
  debug: true,
  environment: process.env.NODE_ENV || 'production',
  tracesSampleRate: 1.0,
})

