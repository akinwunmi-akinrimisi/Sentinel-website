import { defineType, defineField } from 'sanity'

export const industryPage = defineType({
  name: 'industryPage',
  title: 'Industry Page',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: { source: 'industryName', maxLength: 60 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'industryName',
      type: 'string',
      title: 'Industry name',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'complianceMandate',
      type: 'string',
      title: 'Compliance mandate (short)',
      description: 'e.g., "HIPAA Security Rule § 164.308"',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'complianceMandateFull',
      type: 'text',
      title: 'Compliance mandate (full)',
      rows: 3,
      validation: (Rule) => Rule.required().max(500),
    }),
    defineField({
      name: 'trainingContext',
      type: 'blockContent',
      title: 'Training context',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featuredCaseStudy',
      type: 'reference',
      title: 'Featured case study (optional)',
      to: [{ type: 'caseStudy' }],
    }),
    defineField({
      name: 'homepageOrder',
      type: 'number',
      title: 'Homepage display order',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: 'seoTitle',
      type: 'string',
      title: 'SEO title',
      validation: (Rule) => Rule.required().max(70),
    }),
    defineField({
      name: 'seoDescription',
      type: 'text',
      title: 'SEO description',
      rows: 2,
      validation: (Rule) => Rule.required().max(160),
    }),
  ],
  preview: {
    select: { name: 'industryName', mandate: 'complianceMandate' },
    prepare: ({ name, mandate }) => ({
      title: name ?? 'Industry',
      subtitle: mandate,
    }),
  },
})
