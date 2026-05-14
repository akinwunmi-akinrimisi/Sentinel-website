import { defineType, defineField } from 'sanity'

const DISPLAY_AS = [
  { title: 'Logo', value: 'logo' },
  { title: 'Industry text (anonymized)', value: 'industry-text' },
]

export const clientLogo = defineType({
  name: 'clientLogo',
  title: 'Client Logo',
  type: 'document',
  fields: [
    defineField({
      name: 'companyName',
      type: 'string',
      title: 'Company name (internal)',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'anonymizedAs',
      type: 'string',
      title: 'Anonymized label (shown publicly if displayAs = "industry-text")',
      description: 'e.g., "Regional Bank, Midwest"',
    }),
    defineField({
      name: 'logo',
      type: 'image',
      title: 'Logo',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string', title: 'Alt text' }),
      ],
    }),
    defineField({
      name: 'displayAs',
      type: 'string',
      title: 'Display as',
      options: { list: DISPLAY_AS, layout: 'radio' },
      initialValue: 'industry-text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Display order',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
  ],
  preview: {
    select: { name: 'companyName', anon: 'anonymizedAs', mode: 'displayAs', media: 'logo' },
    prepare: ({ name, anon, mode, media }) => ({
      title: anon ?? name,
      subtitle: mode === 'logo' ? 'Logo' : 'Industry text',
      media,
    }),
  },
})
