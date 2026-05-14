import { defineType, defineField } from 'sanity'

const FAQ_CATEGORIES = [
  { title: 'General', value: 'general' },
  { title: 'Programs', value: 'programs' },
  { title: 'Pricing', value: 'pricing' },
  { title: 'Logistics', value: 'logistics' },
  { title: 'Compliance', value: 'compliance' },
]

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      type: 'string',
      title: 'Question',
      validation: (Rule) => Rule.required().min(8).max(160),
    }),
    defineField({
      name: 'answer',
      type: 'blockContent',
      title: 'Answer',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'string',
      title: 'Category',
      options: { list: FAQ_CATEGORIES, layout: 'dropdown' },
      validation: (Rule) => Rule.required(),
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
    select: { q: 'question', cat: 'category', featured: 'featured' },
    prepare: ({ q, cat, featured }) => ({
      title: q,
      subtitle: `${cat ?? '—'}${featured ? ' · Featured' : ''}`,
    }),
  },
})
