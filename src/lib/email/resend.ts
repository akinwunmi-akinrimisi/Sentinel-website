import { Resend } from 'resend'
import type { ReactElement } from 'react'

type SendArgs = {
  to: string
  subject: string
  react: ReactElement
  replyTo?: string
}

let client: Resend | null = null

function getClient(): Resend | null {
  if (client) return client
  if (!process.env.RESEND_API_KEY) return null
  client = new Resend(process.env.RESEND_API_KEY)
  return client
}

/**
 * Sends an email via Resend. Fail-soft: returns `null` if no API key, no
 * from-email, or send error. Never throws. The route handler logs failures
 * via a Slack alert; user response is unaffected.
 */
export async function sendEmail({ to, subject, react, replyTo }: SendArgs): Promise<string | null> {
  const resend = getClient()
  if (!resend) {
    console.warn('[resend] RESEND_API_KEY not set — skipping send')
    return null
  }
  const from = process.env.RESEND_FROM_EMAIL
  if (!from) {
    console.warn('[resend] RESEND_FROM_EMAIL not set — skipping send')
    return null
  }

  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      react,
      ...(replyTo ? { replyTo } : {}),
    })
    return result.data?.id ?? null
  } catch (error) {
    console.error('[resend] send failed:', error)
    return null
  }
}
