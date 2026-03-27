import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthedFromRequest } from '@/lib/adminAuth'
import { getSupabaseAdmin, isSupabaseAdminUsingFallback } from '@/lib/supabaseAdmin'

const SERVICE_ROLE_WARNING =
  'Admin API is using NEXT_PUBLIC_SUPABASE_* fallback. Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel Production.'

export async function GET(req: NextRequest) {
  if (!isAdminAuthedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await (supabase as any)
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      const message = error.message || 'Unknown Supabase error'
      console.error('[admin/orders] Supabase query failed:', message)
      return NextResponse.json(
        {
          error: message,
          detail: message,
          warning: isSupabaseAdminUsingFallback() ? SERVICE_ROLE_WARNING : undefined,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      ok: true,
      orders: Array.isArray(data) ? data : [],
      warning: isSupabaseAdminUsingFallback() ? SERVICE_ROLE_WARNING : undefined,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[admin/orders] Unexpected error:', message)

    return NextResponse.json(
      {
        error: message,
        detail: message,
        warning: isSupabaseAdminUsingFallback() ? SERVICE_ROLE_WARNING : undefined,
      },
      { status: 500 },
    )
  }
}
