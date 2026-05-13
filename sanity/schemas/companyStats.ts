import { defineType, defineField } from 'sanity'

const rateField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'number',
    validation: (Rule) =>
      Rule.required().integer().min(0).max(100),
  })

const countField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'number',
    validation: (Rule) => Rule.required().integer().min(0),
  })

/**
 * Singleton — exactly one document of this type may exist.
 * Enforcement: see sanity.config.ts document.actions filter (Task 9).
 *
 * Drives:
 *   - <Hero> stat pillar (passRate / professionalsCertified / enterpriseClients / auditsPassed)
 *   - <TrustBar> caption ("{enterpriseClients} enterprise clients certified...")
 *   - <ResultsByProgram> per-program pass rates (PR 5)
 *   - <ProposalCTA> "{availableSlots} spots remaining" callout (PR 7)
 */
export const companyStats = defineType({
  name: 'companyStats',
  title: 'Company Stats (singleton)',
  type: 'document',
  fields: [
    rateField('passRate', 'Overall first-attempt pass rate (%)'),
    countField('professionalsCertified', 'Professionals certified'),
    countField('enterpriseClients', 'Enterprise clients'),
    countField('auditsPassed', 'Compliance audits passed'),
    countField('averageWeeks', 'Average weeks to certification'),
    countField('availableSlots', 'Available slots (next cohort)'),
    rateField('passRateSecurityPlus', 'Security+ first-attempt pass rate (%)'),
    rateField('passRateCySAPlus', 'CySA+ first-attempt pass rate (%)'),
    rateField('passRateCASPPlus', 'CASP+ first-attempt pass rate (%)'),
    countField('avgWeeksSecurityPlus', 'Security+ avg weeks to certification'),
    countField('avgWeeksCySAPlus', 'CySA+ avg weeks to certification'),
    countField('avgWeeksCASPPlus', 'CASP+ avg weeks to certification'),
    defineField({
      name: 'asOfDate',
      title: 'As of (date these numbers were measured)',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { passRate: 'passRate', asOf: 'asOfDate' },
    prepare: ({ passRate, asOf }) => ({
      title: 'Company Stats',
      subtitle: `${passRate ?? '–'}% pass rate · as of ${
        asOf ? new Date(asOf).toLocaleDateString() : '—'
      }`,
    }),
  },
})
