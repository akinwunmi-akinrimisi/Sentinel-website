import type { SchemaTypeDefinition } from 'sanity'

import { blockContent } from './blockContent'
import { companyStats } from './companyStats'
import { testimonial } from './testimonial'
import { caseStudy } from './caseStudy'
import { programPage } from './programPage'
import { industryPage } from './industryPage'
import { faq } from './faq'
import { pressMention } from './pressMention'
import { clientLogo } from './clientLogo'

export const schemaTypes: SchemaTypeDefinition[] = [
  // Shared
  blockContent,
  // Documents
  companyStats,
  testimonial,
  caseStudy,
  programPage,
  industryPage,
  faq,
  pressMention,
  clientLogo,
]
