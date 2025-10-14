export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate request body
  if (!body.email || !body.message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and message are required',
    })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email format',
    })
  }

  // Validate message length
  if (body.message.length < 10) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message must be at least 10 characters long',
    })
  }

  try {
    // Get Resend API key and recipient email from environment variables
    const resendApiKey = process.env.RESEND_API_KEY
    const recipientEmail = process.env.CONTACT_EMAIL

    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not configured')
      throw createError({
        statusCode: 500,
        statusMessage: 'Email service is not configured',
      })
    }

    // Send email using Resend API
    const response = await $fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        from: 'Photography Portfolio <onboarding@resend.dev>', 
        to: [recipientEmail],
        reply_to: body.email,
        subject: `New Contact Form Submission from ${body.email}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${body.email}</p>
          <p><strong>Message:</strong></p>
          <p>${body.message.replace(/\n/g, '<br>')}</p>
        `,
        text: `
New Contact Form Submission

From: ${body.email}

Message:
${body.message}
        `,
      },
    })

    return {
      success: true,
      message: 'Email sent successfully',
    }
  } catch (error: any) {
    console.error('Error sending email:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send email',
    })
  }
})


