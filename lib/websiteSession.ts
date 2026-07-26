import { supabaseAdmin } from './supabaseAdmin'
import { WEBSITE_SESSION_SLUG } from './websiteSession.client'

export { WEBSITE_SESSION_SLUG }
export const WEBSITE_SESSION_NAME = 'Website'

const CACHE_TTL_MS = 5 * 60 * 1000
let cachedId: string | null = null
let cachedAt = 0

/**
 * Every lead from the embedded calculator is filed under one standing session,
 * so website activity can be tracked separately from event sessions. Created on
 * first use, so there is nothing to set up by hand.
 */
export async function getWebsiteSessionId(): Promise<string | null> {
  if (cachedId && Date.now() - cachedAt < CACHE_TTL_MS) return cachedId

  const { data: existing } = await supabaseAdmin
    .from('sessions')
    .select('id')
    .eq('slug', WEBSITE_SESSION_SLUG)
    .maybeSingle()

  if (existing?.id) {
    cachedId = existing.id
    cachedAt = Date.now()
    return cachedId
  }

  const { data: created } = await supabaseAdmin
    .from('sessions')
    .insert({ name: WEBSITE_SESSION_NAME, slug: WEBSITE_SESSION_SLUG, is_live: true })
    .select('id')
    .single()

  cachedId = created?.id ?? null
  cachedAt = Date.now()
  return cachedId
}
