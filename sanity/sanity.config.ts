import { defineConfig } from 'sanity'
import { structureTool, type StructureBuilder } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'

/**
 * Singleton list builder for companyStats — shows the single document directly
 * instead of an empty "Create new" list.
 */
const singletonDocs = ['companyStats']
const listableDocs = [
  'testimonial',
  'caseStudy',
  'programPage',
  'industryPage',
  'faq',
  'pressMention',
  'clientLogo',
]

export default defineConfig({
  name: 'sentinel-institute',
  title: 'Sentinel Institute CMS',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [
    structureTool({
      structure: (S: StructureBuilder) =>
        S.list()
          .title('Sentinel Institute')
          .items([
            // Singletons
            S.listItem()
              .title('Company Stats')
              .id('companyStats')
              .child(
                S.editor()
                  .id('companyStats')
                  .schemaType('companyStats')
                  .documentId('companyStats')
              ),
            S.divider(),
            // List types
            ...listableDocs.map((typeName) =>
              S.documentTypeListItem(typeName).title(
                typeName.charAt(0).toUpperCase() + typeName.slice(1)
              )
            ),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    // Hide singleton docs from the global "New document" menu.
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonDocs.includes(schemaType)),
  },
  document: {
    // Strip duplicate + delete from singleton docs.
    actions: (prev, { schemaType }) =>
      singletonDocs.includes(schemaType)
        ? prev.filter(
            ({ action }) => !['duplicate', 'delete', 'unpublish'].includes(action ?? '')
          )
        : prev,
    // Force companyStats to use the fixed documentId.
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global'
        ? prev.filter(({ templateId }) => !singletonDocs.includes(templateId))
        : prev,
  },
})
