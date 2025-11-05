export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const expectedDsn = config.public.sentryDsn
  
  // Security: Only allow forwarding if we have a configured DSN
  if (!expectedDsn) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Sentry tunnel not configured',
    })
  }

  const body = await readRawBody(event, 'utf-8')
  
  if (!body) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No body provided',
    })
  }

  const envelope = body
  const pieces = envelope.split('\n')
  const header = JSON.parse(pieces[0])
  
  const dsn = header.dsn
  if (!dsn) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No DSN found in envelope header',
    })
  }

  // Security: Validate that the DSN matches our expected DSN
  if (dsn !== expectedDsn) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid DSN',
    })
  }

  // Parse the expected DSN to extract allowed host and project
  const expectedDsnUrl = new URL(expectedDsn)
  const projectId = expectedDsnUrl.pathname.replace('/', '')
  const sentryHost = expectedDsnUrl.host

  // Forward the envelope to Sentry
  try {
    const sentryUrl = `https://${sentryHost}/api/${projectId}/envelope/`
    
    const response = await $fetch(sentryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
      },
      body: envelope,
    })

    return response
  } catch (error: any) {
    console.error('Error forwarding to Sentry:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to forward envelope to Sentry',
    })
  }
})

