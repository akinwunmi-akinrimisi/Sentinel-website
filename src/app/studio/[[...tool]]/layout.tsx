import type { ReactNode } from 'react'
import type { Metadata } from 'next'

/**
 * Studio layout — strips the marketing Header/Footer that the (marketing)
 * route group adds. Studio is a full-viewport SPA.
 */
export default function StudioLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export const metadata: Metadata = {
  title: 'Sentinel Institute CMS',
  robots: 'noindex,nofollow',
}
