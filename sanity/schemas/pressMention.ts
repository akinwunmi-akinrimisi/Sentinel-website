import { defineType, defineField } from 'sanity'

export const pressMention = defineType({
  name: 'pressMention',
  title: 'Press Mention',
  type: 'document',
  fields: [
    defineField({
      name: 'outletName',
      type: 'string',
      title: 'Outlet name',
      description: 'e.g., "SC Magazine", "Dark Reading", "CyberScoop"',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'articleTitle',
      type: 'string',
      title: 'Article title',
      validation: (Rule) => Rule.required().max(160),
    }),
    defineField({
      name: 'url',
      type: 'url',
      title: 'Article URL',
      validation: (Rule) =>
        Rule.required().uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'publishedDate',
      type: 'datetime',
      title: 'Published date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      type: 'image',
      title: 'Outlet logo',
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
      name: 'showOnHero',
      type: 'boolean',
      title: 'Show on hero press band',
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
    select: { outlet: 'outletName', articleTitle: 'articleTitle' },
    prepare: ({ outlet, articleTitle }) => ({ title: outlet, subtitle: articleTitle }),
  },
})
