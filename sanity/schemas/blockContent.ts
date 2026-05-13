import { defineType, defineArrayMember } from 'sanity'

/**
 * Shared Portable Text array used by every document type that needs rich text:
 *   caseStudy (challenge, solution, outcome)
 *   programPage (whoNeedsIt, curriculumOutline)
 *   industryPage (trainingContext)
 *   faq (answer)
 *
 * Locked to a constrained set of styles + marks per the brand voice — no H1
 * (the page owns H1), no code blocks, no decorations beyond strong + em + links.
 * Link marks enforce HTTPS-only per spec §6.9.
 */
export const blockContent = defineType({
  name: 'blockContent',
  title: 'Block Content',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Heading 2', value: 'h2' },
        { title: 'Heading 3', value: 'h3' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Number', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
                validation: (Rule) =>
                  Rule.required().uri({
                    scheme: ['https'],
                  }),
              },
            ],
          },
        ],
      },
    }),
  ],
})
