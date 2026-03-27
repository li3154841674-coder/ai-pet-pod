import { createClient } from '@supabase/supabase-js'

let cached:
  | ReturnType<typeof createClient>
  | null = null
let usingFallbackAnonKey = false

export function isSupabaseAdminUsingFallback() {
  return usingFallbackAnonKey
}

export function getSupabaseAdminStrict() {
  if (cached && !usingFallbackAnonKey) return cached

  const primaryUrl = process.env.SUPABASE_URL
  const primaryServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!primaryUrl || !primaryServiceRoleKey) {
    throw new Error('Supabase SERVICE_ROLE env missing for strict admin client (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).')
  }

  usingFallbackAnonKey = false
  cached = createClient(primaryUrl, primaryServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return cached
}

export function getSupabaseAdmin() {
  if (cached) return cached

  const primaryUrl = process.env.SUPABASE_URL
  const primaryServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const fallbackUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const fallbackAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const url = primaryUrl || fallbackUrl
  const key = primaryServiceRoleKey || fallbackAnonKey

  if (!url || !key) {
    throw new Error(
      'Supabase env not configured. Tried SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    )
  }

  usingFallbackAnonKey = !primaryUrl || !primaryServiceRoleKey

  if (usingFallbackAnonKey) {
    console.warn(
      '[supabaseAdmin] Falling back to NEXT_PUBLIC_SUPABASE_* envs. For admin APIs, you MUST configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Production.',
    )
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return cached
}

