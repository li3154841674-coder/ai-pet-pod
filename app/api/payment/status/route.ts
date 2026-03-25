import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getOrder, updateOrderStatus } from '@/lib/orderStore'

function generateNonceStr(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

function generateSign(params: Record<string, string>, appSecret: string): string {
  const sortedKeys = Object.keys(params).sort()
  
  const signString = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&') + appSecret
  
  return crypto.createHash('md5').update(signString).digest('hex')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { error: '缺少订单号' },
        { status: 400 }
      )
    }

    const appId = process.env.XUNHU_APPID
    const appSecret = process.env.XUNHU_APPSECRET
    const gateway = process.env.XUNHU_GATEWAY

    let orderStatus = 'pending'
    
    if (appId && appSecret && gateway) {
      try {
        const params: Record<string, string> = {
          version: '1.0',
          appid: appId,
          trade_order_id: orderId,
          time: Math.floor(Date.now() / 1000).toString(),
          nonce_str: generateNonceStr(),
        }

        const hash = generateSign(params, appSecret)
        params.hash = hash

        const queryString = Object.keys(params)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
          .join('&')

        const requestUrl = `${gateway}?${queryString}`

        const response = await fetch(requestUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        })

        if (response.ok) {
          const responseText = await response.text()
          let result: any

          try {
            result = JSON.parse(responseText)
            console.log('虎皮椒查单API响应:', result)

            if (result.status === 'OD') {
              orderStatus = 'paid'
              updateOrderStatus(orderId, 'paid')
            }
          } catch (parseError) {
            console.warn('虎皮椒查单返回的不是JSON:', responseText.substring(0, 200))
          }
        }
      } catch (apiError) {
        console.warn('调用虎皮椒查单API失败:', apiError)
      }
    }

    const localOrder = getOrder(orderId)

    if (!localOrder) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      orderId: localOrder.id,
      status: orderStatus,
      createdAt: localOrder.createdAt,
    })

  } catch (error) {
    console.error('查询订单状态错误:', error)
    return NextResponse.json(
      { error: '查询订单状态失败' },
      { status: 500 }
    )
  }
}
