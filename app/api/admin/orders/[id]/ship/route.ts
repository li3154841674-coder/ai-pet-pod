import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthedFromRequest } from '@/lib/adminAuth'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthedFromRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params
  if (!id) {
    return NextResponse.json({ error: 'Missing order id' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  // 需求：点击按钮把 status 从“已支付”改为“已发货”
  const { data, error } = await (supabase as any)
    .from('orders')
    .update({ status: 'shipped' })
    .eq('id', id)
    .select('*')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, order: data })
}

