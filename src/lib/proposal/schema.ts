import { z } from 'zod'

/**
 * Personal email domains rejected by business-email validation.
 * Per WEBSITE_CONTEXT.md §9.
 */
const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'icloud.com',
  'outlook.com',
  'me.com',
  'aol.com',
] as const

const COMPANY_SIZE = ['50-150', '150-500', '500-2000', '2000+'] as const
const INDUSTRY = [
  'Financial Services',
  'Healthcare',
  'Government & Defense',
  'Insurance',
  'Legal',
  'Utilities & Energy',
  'Pharmaceuticals',
  'Technology',
  'Other',
] as const
const TEAM_SIZE = ['5-10', '10-25', '25-50', '50+'] as const
const CERTIFICATIONS = ['Security+', 'CySA+', 'CASP+', 'Security Awareness', 'Not sure'] as const
const COMPLIANCE_DRIVER = [
  'HIPAA',
  'PCI-DSS',
  'CMMC Level 2 or 3',
  'SOC 2',
  'NIST CSF',
  'NERC CIP',
  'Board directive',
  'Internal audit finding',
  'Other',
] as const
const TIMELINE = ['Within 30 days', '1-3 months', '3-6 months', 'Planning ahead'] as const
const REFERRAL = ['Google', 'LinkedIn', 'Referral', 'Press', 'Event', 'Other'] as const

const usPhoneRegex = /^[\d\s().+-]{10,20}$/

export const proposalSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(80),
  businessEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email('Enter a valid email address')
    .refine((email) => {
      const domain = email.split('@')[1] ?? ''
      return !(PERSONAL_EMAIL_DOMAINS as readonly string[]).includes(domain)
    }, 'Please use your company email address.'),
  phone: z
    .string()
    .trim()
    .regex(usPhoneRegex, 'Enter a valid US phone number'),
  company: z.string().trim().min(2, 'Company is required').max(120),
  jobTitle: z.string().trim().min(2, 'Job title is required').max(120),
  companySize: z.enum(COMPANY_SIZE),
  industry: z.enum(INDUSTRY),
  teamSize: z.enum(TEAM_SIZE),
  certifications: z
    .array(z.enum(CERTIFICATIONS))
    .min(1, 'Select at least one certification or "Not sure"'),
  complianceDriver: z.enum(COMPLIANCE_DRIVER),
  timeline: z.enum(TIMELINE),
  referralSource: z.enum(REFERRAL),
  notes: z.string().trim().max(2000).optional().default(''),
  /** Honeypot — must be empty. Bots fill all fields; humans never see it (sr-only). */
  hp_field: z.string().max(0).optional().default(''),
})

export type ProposalInput = z.infer<typeof proposalSchema>

export const PROPOSAL_OPTIONS = {
  companySize: COMPANY_SIZE,
  industry: INDUSTRY,
  teamSize: TEAM_SIZE,
  certifications: CERTIFICATIONS,
  complianceDriver: COMPLIANCE_DRIVER,
  timeline: TIMELINE,
  referralSource: REFERRAL,
} as const
