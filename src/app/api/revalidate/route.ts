import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * POST /api/revalidate?secret=<SANITY_REVALIDATE_SECRET>
 *
 * Body (sent by Sanity webhook): `{ "_type": "companyStats", "_id": "..." }`
 *
 * Triggers ISR revalidation of:
 *   - the homepage path `/`
 *   - the `homepage` tag (used by every query in queries.ts)
 *   - a per-type tag `sanity:<_type>` so future per-type tag fetches can be
 *     invalidated independently
 *
 * Returns 401 if the secret query param doesn't match SANITY_REVALIDATE_SECRET.
 */
export async function POST(req: NextRequest) {
  const expectedSecret = process.env.SANITY_REVALIDATE_SECRET
  const providedSecret = req.nextUrl.searchParams.get('secret')

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  let body: { _type?: string } = {}
  try {
    body = (await req.json()) as { _type?: string }
  } catch {
    // Sanity webhook may send empty body during manual ping — treat as homepage refresh.
  }

  revalidatePath('/')
  revalidateTag('homepage', 'max')
  if (body._type) {
    revalidateTag(`sanity:${body._type}`, 'max')
  }

  return NextResponse.json({
    revalidated: true,
    type: body._type ?? null,
    now: Date.now(),
  })
}

/** Block GET so the route doesn't show up in casual scans. */
export async function GET() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
}
