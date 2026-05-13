import { defineType, defineField, defineArrayMember } from 'sanity'

const COMPLIANCE_DRIVERS = [
  { title: 'HIPAA', value: 'HIPAA' },
  { title: 'PCI-DSS', value: 'PCI-DSS' },
  { title: 'CMMC', value: 'CMMC' },
  { title: 'SOC 2', value: 'SOC 2' },
  { title: 'NIST CSF', value: 'NIST CSF' },
  { title: 'NERC CIP', value: 'NERC CIP' },
  { title: 'Other', value: 'Other' },
]

export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: (doc) => `${doc.clientIndustry ?? ''}-${doc.complianceDriver ?? ''}`,
        maxLength: 60,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'clientIndustry',
      type: 'string',
      title: 'Client industry',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'clientIndustryAnonymized',
      type: 'string',
      title: 'Anonymized industry label (optional)',
    }),
    defineField({
      name: 'complianceDriver',
      type: 'string',
      title: 'Compliance driver',
      options: { list: COMPLIANCE_DRIVERS, layout: 'dropdown' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'teamSize',
      type: 'number',
      title: 'Team size',
      validation: (Rule) => Rule.required().integer().min(1),
    }),
    defineField({
      name: 'weeksToCertification',
      type: 'number',
      title: 'Weeks to certification',
      validation: (Rule) => Rule.required().integer().min(1),
    }),
    defineField({
      name: 'certificationsPassed',
      type: 'array',
      title: 'Certifications passed',
      of: [defineArrayMember({ type: 'string' })],
      validation: (Rule) => Rule.required().min(1).unique(),
    }),
    defineField({
      name: 'buyerName',
      type: 'string',
      title: 'Buyer name',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'buyerTitle',
      type: 'string',
      title: 'Buyer title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'buyerHeadshot',
      type: 'image',
      title: 'Buyer headshot',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'buyerQuote',
      type: 'text',
      title: 'Buyer quote',
      rows: 3,
      validation: (Rule) =>
        Rule.required().custom((value) => {
          if (!value) return true
          return value.split('\n').length <= 4 || 'Maximum 4 lines'
        }),
    }),
    defineField({
      name: 'challenge',
      type: 'blockContent',
      title: 'Challenge',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'solution',
      type: 'blockContent',
      title: 'Solution',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'outcome',
      type: 'blockContent',
      title: 'Outcome',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'outcomeMetrics',
      type: 'array',
      title: 'Outcome metrics',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'metric',
          fields: [
            defineField({
              name: 'label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'value',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { label: 'label', value: 'value' },
            prepare: ({ label, value }) => ({ title: `${value} — ${label}` }),
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(1).max(6),
    }),
    defineField({
      name: 'clientLogo',
      type: 'image',
      title: 'Client logo (optional, used only if not anonymized)',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string', title: 'Alt text' }),
      ],
    }),
    defineField({
      name: 'publishedDate',
      type: 'datetime',
      title: 'Published date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      title: 'Featured on homepage',
      initialValue: false,
    }),
  ],
  preview: {
    select: { industry: 'clientIndustry', driver: 'complianceDriver', featured: 'featured' },
    prepare: ({ industry, driver, featured }) => ({
      title: `${industry} — ${driver}`,
      subtitle: featured ? 'Featured' : 'Unlisted',
    }),
  },
})
