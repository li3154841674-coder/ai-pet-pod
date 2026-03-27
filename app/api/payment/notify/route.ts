import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const text = await request.text()
    console.log('【1. 收到迅虎回调原始数据】:', text)

    const params = new URLSearchParams(text)
    const trade_order_id = params.get('trade_order_id')
    const status = params.get('status')
    console.log('【2. 解析出单号】:', trade_order_id, '| 状态:', status)

    if (status === 'OD' && trade_order_id) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!supabaseUrl || !supabaseKey) {
        console.error('【严重错误】缺少 Supabase URL 或 SERVICE_ROLE_KEY 环境变量！')
        return new Response('success', { status: 200, headers: { 'Content-Type': 'text/plain' } })
      }

      // 强制使用 Service Role Key 绕过 RLS 权限拦截
      const supabase = createClient(supabaseUrl, supabaseKey)

      // 先按 id 主键匹配；若未命中，再按 order_id 兜底
      let { data, error } = await (supabase as any)
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', trade_order_id)
        .select()

      if (!error && (!data || data.length === 0)) {
        const fallback = await (supabase as any)
          .from('orders')
          .update({ status: 'paid' })
          .eq('order_id', trade_order_id)
          .select()
        data = fallback.data
        error = fallback.error
      }

      if (error) {
        console.error('【3. 数据库更新报错】:', error.message, error.details)
      } else if (!data || data.length === 0) {
        console.error(
          '【3. 幽灵订单】更新失败！数据库 orders 表中根本找不到 id/order_id 为',
          trade_order_id,
          '的订单！(请检查数据库主键字段是叫 id 还是 order_id?)',
        )
      } else {
        console.log('【3. 胜利】数据库更新成功！被更新的数据:', data)
      }
    }

    return new Response('success', { status: 200, headers: { 'Content-Type': 'text/plain' } })
  } catch (error) {
    console.error('【彻底崩溃】回调接口发生未捕获异常:', error)
    return new Response('success', { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const payload: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      payload[key] = value
    })

    console.log('【收到虎皮椒回调(GET)】', payload)
    return NextResponse.redirect(new URL('/order', request.url))
  } catch (error) {
    console.error('[payment/notify] GET handling error', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}
