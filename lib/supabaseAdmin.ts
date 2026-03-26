import { createClient } from '@supabase/supabase-js'

let cached:
  | ReturnType<typeof createClient>
  | null = null

export function getSupabaseAdmin() {
  if (cached) return cached

  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase env not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)')
  }

  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return cached
}

