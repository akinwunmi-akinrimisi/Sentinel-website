import { NextResponse, after, type NextRequest } from 'next/server'
import { proposalSchema } from '@/lib/proposal/schema'
import { rateLimit } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/email/resend'
import {
  InternalNotificationEmail,
  ProspectConfirmationEmail,
} from '@/lib/email/templates'

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown'
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  return 'unknown'
}

async function notifySlack(payload: {
  company: string
  buyer: string
  email: string
  industry: string
  complianceDriver: string
  teamSize: string
  timeline: string
  failedSteps?: string[]
}) {
  const url = process.env.SLACK_WEBHOOK_URL
  if (!url) return
  const failed = payload.failedSteps?.length ? ` ⚠️ failed: ${payload.failedSteps.join(', ')}` : ''
  const text =
    `🟢 *New proposal* — ${payload.company} (${payload.industry})\n` +
    `${payload.buyer} · ${payload.email}\n` +
    `Driver: ${payload.complianceDriver} · Team: ${payload.teamSize} · Start: ${payload.timeline}` +
    failed
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) {
      console.error('[slack] webhook returned', res.status, await res.text())
    }
  } catch (error) {
    console.error('[slack] webhook failed:', error)
  }
}

async function submitToHubSpot(payload: Record<string, unknown>): Promise<boolean> {
  const portalId = process.env.HUBSPOT_PORTAL_ID
  const formId = process.env.HUBSPOT_FORM_ID
  if (!portalId || !formId) return false
  try {
    const res = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${encodeURIComponent(portalId)}/${encodeURIComponent(formId)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: Object.entries(payload).map(([name, value]) => ({
            name,
            value: Array.isArray(value) ? value.join(', ') : String(value ?? ''),
          })),
          context: { pageUri: process.env.NEXT_PUBLIC_SITE_URL ?? '', pageName: 'Request a Proposal' },
        }),
      }
    )
    return res.ok
  } catch (error) {
    console.error('[hubspot] submit failed:', error)
    return false
  }
}

export async function POST(req: NextRequest) {
  // 1. Parse body
  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
  }

  // 2. Re-validate against the same schema the client used
  const parsed = proposalSchema.safeParse(json)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return NextResponse.json(
      {
        field: firstIssue?.path.join('.') ?? null,
        message: firstIssue?.message ?? 'Invalid input',
      },
      { status: 422 }
    )
  }

  const payload = parsed.data

  // 3. Rate limit by IP
  const ip = getClientIp(req)
  const rl = await rateLimit(ip)
  if (!rl.success) {
    return NextResponse.json(
      {
        message: `You've submitted recently. Try again in ${rl.retryAfterSeconds} seconds.`,
        retryAfter: rl.retryAfterSeconds,
      },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
    )
  }

  // 4. Fan out the integrations
  const internalTo = process.env.RESEND_TO_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? ''
  const [prospectResult, internalResult, hubspotOk] = await Promise.all([
    sendEmail({
      to: payload.businessEmail,
      subject: 'We received your proposal request — Sentinel Institute',
      react: ProspectConfirmationEmail({ fullName: payload.fullName }),
    }),
    internalTo
      ? sendEmail({
          to: internalTo,
          subject: `New proposal — ${payload.company} (${payload.complianceDriver})`,
          react: InternalNotificationEmail({ payload, ip }),
          replyTo: payload.businessEmail,
        })
      : Promise.resolve(null),
    submitToHubSpot({
      firstname: payload.fullName.split(/\s+/)[0] ?? '',
      lastname: payload.fullName.split(/\s+/).slice(1).join(' '),
      email: payload.businessEmail,
      phone: payload.phone,
      company: payload.company,
      jobtitle: payload.jobTitle,
      company_size: payload.companySize,
      industry: payload.industry,
      team_size: payload.teamSize,
      certifications_of_interest: payload.certifications,
      compliance_driver: payload.complianceDriver,
      timeline: payload.timeline,
      referral_source: payload.referralSource,
      notes: payload.notes,
    }),
  ])

  const failedSteps: string[] = []
  if (prospectResult === null && process.env.RESEND_API_KEY) failedSteps.push('prospect-email')
  if (internalResult === null && internalTo && process.env.RESEND_API_KEY) failedSteps.push('internal-email')
  if (!hubspotOk && process.env.HUBSPOT_PORTAL_ID) failedSteps.push('hubspot')

  // Slack is fire-and-forget — runs after response is flushed to client.
  after(() =>
    notifySlack({
      company: payload.company,
      buyer: payload.fullName,
      email: payload.businessEmail,
      industry: payload.industry,
      complianceDriver: payload.complianceDriver,
      teamSize: payload.teamSize,
      timeline: payload.timeline,
      failedSteps,
    })
  )

  return NextResponse.json({ success: true })
}

export async function GET() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
}
