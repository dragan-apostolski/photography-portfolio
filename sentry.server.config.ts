import * as Sentry from '@sentry/nuxt'

// Only initialize Sentry in production
const isProduction = process.env.NODE_ENV === 'production'

if (isProduction) {
  Sentry.init({
    dsn: process.env.NUXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 0.1, // Sample 10% of transactions in production
    
    // Filter out any localhost URLs as a safety measure
    beforeSend(event) {
      const url = event.request?.url
      if (url && (url.includes('localhost') || url.includes('127.0.0.1'))) {
        return null // Don't send the event
      }
      return event
    },
  })
}

