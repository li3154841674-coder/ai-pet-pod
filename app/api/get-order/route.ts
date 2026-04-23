import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function normalizePhone(value: string) {
  return value.replace(/\D/g, '').slice(0, 11)
}

function maskPhone(phone: string) {
  const digits = normalizePhone(phone)
  if (digits.length !== 11) return phone
  return `${digits.slice(0, 3)}****${digits.slice(7)}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const phone = typeof body?.phone === 'string' ? normalizePhone(body.phone) : ''

    if (!phone || phone.length !== 11) {
      return NextResponse.json({ error: '请输入正确的手机号' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: '订单查询服务未配置' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await (supabase as any)
      .from('orders')
      .select('*')
      .eq('phone', phone)
      .in('status', ['pending', 'paid', 'shipped'])
      .order('created_at', { ascending: false })
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: '查询订单失败' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: '未找到订单' }, { status: 404 })
    }

    const order = {
      id: data.id || data.order_id || data.trade_order_id || null,
      amount: typeof data.amount === 'number' ? data.amount : typeof data.total_fee === 'number' ? data.total_fee : null,
      status: data.status || 'pending',
      createdAt: data.created_at || data.createdAt || null,
    }

    const mapped = {
      size: data.pet_size || data.size || null,
      recipientName: data.customer_name || data.recipient_name || null,
      contactNumber: maskPhone(data.phone || phone),
      address: data.address || data.shipping_address || null,
      designPreview: data.image_url || data.generated_image_url || null,
      expressCompany: data.express_company || data.shipping_company || null,
      expressNumber: data.express_number || data.shipping_number || null,
    }

    const logistics = [] as Array<{ time?: string; status?: string; location?: string }>
    if (data.status === 'shipped' || data.express_number) {
      logistics.push({ time: '刚刚', status: `快递 ${mapped.expressCompany || '物流公司'} 已揽收`, location: mapped.expressNumber || '' })
      logistics.push({ time: '刚刚', status: '订单已发货，正在同步物流轨迹', location: '系统更新中' })
    } else if (data.status === 'paid') {
      logistics.push({ time: '刚刚', status: '收到您的订单，正在为您安排制作', location: '生产中' })
    } else {
      logistics.push({ time: '刚刚', status: '订单已创建，等待支付', location: '待支付' })
    }

    return NextResponse.json({ success: true, order, mapped, logistics })
  } catch (error) {
    return NextResponse.json({ error: '查询订单失败' }, { status: 500 })
  }
}
