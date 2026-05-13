import { defineType, defineField, defineArrayMember } from 'sanity'

const ALLOWED_SLUGS = ['security-plus', 'cysa-plus', 'casp-plus'] as const

export const programPage = defineType({
  name: 'programPage',
  title: 'Program Page',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: { source: 'certName', maxLength: 30 },
      validation: (Rule) =>
        Rule.required().custom((slug) => {
          const value = (slug as { current?: string } | undefined)?.current
          if (!value) return 'Slug is required'
          return (ALLOWED_SLUGS as readonly string[]).includes(value)
            ? true
            : `Slug must be one of: ${ALLOWED_SLUGS.join(', ')}`
        }),
    }),
    defineField({
      name: 'certName',
      type: 'string',
      title: 'Certification name',
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: 'eyebrow',
      type: 'string',
      title: 'Eyebrow label',
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: 'oneliner',
      type: 'text',
      title: 'One-liner',
      rows: 2,
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'priceUSD',
      type: 'number',
      title: 'Price (USD)',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'durationWeeks',
      type: 'number',
      title: 'Duration (weeks)',
      validation: (Rule) => Rule.required().integer().min(1),
    }),
    defineField({
      name: 'sessionsPerWeek',
      type: 'number',
      title: 'Sessions per week',
      validation: (Rule) => Rule.required().integer().min(1).max(7),
    }),
    defineField({
      name: 'whoNeedsIt',
      type: 'blockContent',
      title: 'Who needs it',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'curriculumOutline',
      type: 'blockContent',
      title: 'Curriculum outline',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'examObjectives',
      type: 'array',
      title: 'Exam objectives',
      of: [defineArrayMember({ type: 'string' })],
      validation: (Rule) => Rule.required().min(1).unique(),
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
    select: { name: 'certName', slug: 'slug.current', price: 'priceUSD' },
    prepare: ({ name, slug, price }) => ({
      title: name ?? slug ?? 'Program',
      subtitle: price !== undefined ? `$${price.toLocaleString()}` : '—',
    }),
  },
})
