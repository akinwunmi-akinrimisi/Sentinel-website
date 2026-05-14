import { defineType, defineField, defineArrayMember } from 'sanity'

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
    defineField({
      name: 'complianceClauses',
      type: 'array',
      title: 'Compliance clauses',
      description: '3–6 specific regulatory citations (e.g., HIPAA § 164.308(a)(5)(i)).',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'complianceClause',
          fields: [
            defineField({ name: 'code', type: 'string', validation: (Rule) => Rule.required().max(40) }),
            defineField({ name: 'title', type: 'string', validation: (Rule) => Rule.required().max(120) }),
            defineField({ name: 'description', type: 'text', rows: 3, validation: (Rule) => Rule.required().max(400) }),
          ],
          preview: { select: { title: 'code', subtitle: 'title' } },
        }),
      ],
      validation: (Rule) => Rule.required().min(3).max(6),
    }),
    defineField({
      name: 'riskScenarios',
      type: 'array',
      title: 'Risk scenarios',
      description: '2–3 declassified breach narratives showing what failed audits look like in this industry.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'riskScenario',
          fields: [
            defineField({ name: 'headline', type: 'string', validation: (Rule) => Rule.required().max(80) }),
            defineField({ name: 'narrative', type: 'text', rows: 5, validation: (Rule) => Rule.required().max(600) }),
          ],
          preview: { select: { title: 'headline' } },
        }),
      ],
      validation: (Rule) => Rule.required().min(2).max(4),
    }),
    defineField({
      name: 'recommendedProgramSlugs',
      type: 'array',
      title: 'Recommended program slugs',
      description: '1–3 program slugs (security-plus / cysa-plus / casp-plus) that map to this industry\'s risk profile.',
      of: [
        defineArrayMember({
          type: 'string',
          options: { list: ['security-plus', 'cysa-plus', 'casp-plus'] },
        }),
      ],
      validation: (Rule) => Rule.required().min(1).max(3).unique(),
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
