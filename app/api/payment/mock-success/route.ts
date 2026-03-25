import { NextRequest, NextResponse } from 'next/server'
import { updateOrderStatus } from '@/lib/orderStore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: '缺少订单号' },
        { status: 400 }
      )
    }

    const order = updateOrderStatus(orderId, 'paid')

    if (!order) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '模拟支付成功',
      orderId: order.id,
      status: order.status,
    })

  } catch (error) {
    console.error('模拟支付错误:', error)
    return NextResponse.json(
      { error: '模拟支付失败' },
      { status: 500 }
    )
  }
}
