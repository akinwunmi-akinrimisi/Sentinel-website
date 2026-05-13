import { defineType, defineField } from 'sanity'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'fullName',
      type: 'string',
      title: 'Full name',
      validation: (Rule) => Rule.required().min(2).max(80),
    }),
    defineField({
      name: 'title',
      type: 'string',
      title: 'Job title',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'company',
      type: 'string',
      title: 'Company',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'industry',
      type: 'string',
      title: 'Industry',
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: 'industryAnonymized',
      type: 'string',
      title: 'Anonymized industry label (shown instead of company)',
      description: 'Set this if the client requires anonymization (e.g., "Regional Bank, Midwest").',
    }),
    defineField({
      name: 'quote',
      type: 'text',
      title: 'Quote',
      rows: 4,
      validation: (Rule) =>
        Rule.required()
          .min(40)
          .max(420)
          .custom((value) => {
            if (!value) return true
            const lineCount = value.split('\n').length
            return lineCount <= 5 || 'Maximum 5 lines'
          }),
    }),
    defineField({
      name: 'portrait',
      type: 'image',
      title: 'Portrait',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          validation: (Rule) => Rule.required().min(4),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'videoUrl',
      type: 'url',
      title: 'Video URL (optional)',
      validation: (Rule) => Rule.uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      title: 'Featured on homepage',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Display order',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
  ],
  preview: {
    select: { name: 'fullName', company: 'company', featured: 'featured', media: 'portrait' },
    prepare: ({ name, company, featured, media }) => ({
      title: `${name} — ${company}`,
      subtitle: featured ? 'Featured' : 'Unlisted',
      media,
    }),
  },
})
