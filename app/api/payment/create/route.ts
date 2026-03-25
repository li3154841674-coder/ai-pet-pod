import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createOrder } from '@/lib/orderStore'

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

export async function POST(request: NextRequest) {
  try {
    const appId = process.env.XUNHU_APPID
    const appSecret = process.env.XUNHU_APPSECRET
    const gateway = process.env.XUNHU_GATEWAY
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    if (!appId || !appSecret || !gateway) {
      return NextResponse.json(
        { error: '虎皮椒支付凭证未配置' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { orderId, title, totalFee = 69.9 } = body

    if (!title) {
      return NextResponse.json(
        { error: '缺少商品名称' },
        { status: 400 }
      )
    }

    const tradeOrderId = orderId || `ORD${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    
    createOrder(tradeOrderId)

    const params: Record<string, string> = {
      version: '1.1',
      appid: appId,
      trade_order_id: tradeOrderId,
      total_fee: totalFee.toFixed(2),
      title: title,
      time: Math.floor(Date.now() / 1000).toString(),
      notify_url: `${siteUrl}/api/payment/notify`,
      return_url: `${siteUrl}/order`,
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
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (!response.ok) {
      throw new Error(`虎皮椒接口请求失败: ${response.status}`)
    }

    const responseText = await response.text()
    let result: any

    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      console.warn('虎皮椒返回的不是JSON，使用备用方案:', responseText.substring(0, 200))
      return NextResponse.json({
        success: true,
        paymentUrl: requestUrl,
        orderId: tradeOrderId,
        message: '支付链接生成成功（备用模式）'
      })
    }

    console.log('虎皮椒API响应:', result)

    const paymentUrl = result.url || result.qrcode || result.pay_url || requestUrl
    
    const finalOrderId = result.trade_order_id || result.orderId || result.id || tradeOrderId
    createOrder(finalOrderId)

    return NextResponse.json({
      success: true,
      paymentUrl,
      orderId: finalOrderId,
      message: '支付链接生成成功',
      rawResponse: result
    })

  } catch (error) {
    console.error('创建支付订单错误:', error)
    return NextResponse.json(
      { error: '创建支付订单失败' },
      { status: 500 }
    )
  }
}
