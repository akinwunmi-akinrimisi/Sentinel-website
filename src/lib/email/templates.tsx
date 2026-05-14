import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { ProposalInput } from '@/lib/proposal/schema'

const styles = {
  body: { backgroundColor: '#FAFAFA', fontFamily: 'Georgia, "Times New Roman", serif', margin: 0, padding: 0 },
  container: { maxWidth: '560px', margin: '40px auto', padding: '40px 32px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' },
  eyebrow: { color: '#1D4ED8', fontFamily: 'Menlo, Consolas, monospace', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.18em', margin: '0 0 16px' },
  heading: { color: '#0A1628', fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '28px', lineHeight: '1.2', margin: '0 0 24px' },
  body_text: { color: '#374151', fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: '15px', lineHeight: '1.6', margin: '0 0 16px' },
  meta: { color: '#6B7280', fontFamily: 'Menlo, Consolas, monospace', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.15em', margin: '4px 0' },
  cta: { color: '#1D4ED8', fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: '15px', fontWeight: 600, textDecoration: 'none' },
  hr: { borderColor: '#E5E7EB', margin: '24px 0' },
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sentinelinstitute.com'
const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK ?? 'https://cal.com/sentinelinstitute/discovery'

interface ProspectConfirmationProps {
  fullName: string
}

export function ProspectConfirmationEmail({ fullName }: ProspectConfirmationProps) {
  const firstName = fullName.split(/\s+/)[0] ?? fullName
  return (
    <Html>
      <Head />
      <Preview>We received your proposal request — Sentinel Institute</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.eyebrow}>Sentinel Institute</Text>
          <Heading style={styles.heading}>Thanks, {firstName}. We&apos;ll be in touch within 1 business day.</Heading>
          <Text style={styles.body_text}>
            Your proposal request reached our training team. A senior advisor will review your
            requirements — team size, compliance driver, target timeline — and respond with a
            tailored proposal within one business day.
          </Text>
          <Text style={styles.body_text}>
            If you&apos;d prefer to talk through the program live, you can book a 20-minute
            discovery call directly on our calendar:
          </Text>
          <Text style={styles.body_text}>
            <Link href={CAL_LINK} style={styles.cta}>Book a discovery call →</Link>
          </Text>
          <Hr style={styles.hr} />
          <Text style={styles.meta}>Sentinel Institute · Chicago, IL · <Link href={SITE_URL} style={{ color: '#6B7280' }}>{SITE_URL.replace('https://', '')}</Link></Text>
        </Container>
      </Body>
    </Html>
  )
}

interface InternalNotificationProps {
  payload: ProposalInput
  ip: string
}

export function InternalNotificationEmail({ payload, ip }: InternalNotificationProps) {
  const certList = payload.certifications.join(', ')
  return (
    <Html>
      <Head />
      <Preview>New proposal request: {payload.company} · {payload.complianceDriver}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.eyebrow}>New Proposal Request</Text>
          <Heading style={styles.heading}>{payload.company} · {payload.complianceDriver}</Heading>

          <Section>
            <Text style={styles.meta}>Buyer</Text>
            <Text style={styles.body_text}>
              {payload.fullName}, {payload.jobTitle}<br />
              <Link href={`mailto:${payload.businessEmail}`} style={styles.cta}>{payload.businessEmail}</Link><br />
              {payload.phone}
            </Text>
          </Section>

          <Hr style={styles.hr} />

          <Section>
            <Text style={styles.meta}>Engagement</Text>
            <Text style={styles.body_text}>
              Industry: {payload.industry}<br />
              Company size: {payload.companySize}<br />
              Team to train: {payload.teamSize}<br />
              Certifications of interest: {certList}<br />
              Compliance driver: {payload.complianceDriver}<br />
              Target start: {payload.timeline}<br />
              Heard about us via: {payload.referralSource}
            </Text>
          </Section>

          {payload.notes ? (
            <>
              <Hr style={styles.hr} />
              <Section>
                <Text style={styles.meta}>Notes</Text>
                <Text style={styles.body_text}>{payload.notes}</Text>
              </Section>
            </>
          ) : null}

          <Hr style={styles.hr} />
          <Text style={styles.meta}>Submitted from {ip}</Text>
        </Container>
      </Body>
    </Html>
  )
}
