import { createClient } from '@supabase/supabase-js'

// Server-only client using the service role key — bypasses RLS.
// Never import this in client components or files with 'use client'.
const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!

export const supabaseAdmin = createClient(url, process.env.SUPABASE_SERVICE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
})
