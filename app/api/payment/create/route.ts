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
  console.log('🚀 支付API被调用')
  
  try {
    console.log('🔧 开始检查环境变量')
    const appId = process.env.XUNHU_APPID
    const appSecret = process.env.XUNHU_APPSECRET
    const gateway = process.env.XUNHU_GATEWAY
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    console.log('环境变量检查:', {
      hasAppId: !!appId,
      hasAppSecret: !!appSecret,
      hasGateway: !!gateway,
      siteUrl
    })

    if (!appId || !appSecret || !gateway) {
      console.error('❌ 虎皮椒支付凭证未配置:', {
        appId: !!appId,
        appSecret: !!appSecret,
        gateway: !!gateway
      })
      return NextResponse.json(
        { 
          error: '虎皮椒支付凭证未配置',
          details: {
            hasAppId: !!appId,
            hasAppSecret: !!appSecret,
            hasGateway: !!gateway
          }
        },
        { status: 500 }
      )
    }

    console.log('✅ 环境变量检查通过')

    console.log('📦 开始读取请求体')
    const body = await request.json()
    console.log('请求体:', body)
    const { orderId, title, totalFee = 69.9 } = body

    if (!title) {
      console.error('❌ 缺少商品名称')
      return NextResponse.json(
        { error: '缺少商品名称' },
        { status: 400 }
      )
    }

    console.log('✅ 请求体检查通过')

    console.log('📋 开始创建订单')
    const tradeOrderId = orderId || `ORD${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    console.log('订单ID:', tradeOrderId)
    
    try {
      const order = createOrder(tradeOrderId)
      console.log('✅ 订单创建成功:', order)
    } catch (orderError) {
      console.error('❌ 创建订单失败:', orderError)
      return NextResponse.json(
        { error: '创建订单失败' },
        { status: 500 }
      )
    }

    console.log('✅ 订单创建成功')

    console.log('🔐 开始生成签名')
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

    console.log('签名参数:', params)
    
    const hash = generateSign(params, appSecret)
    params.hash = hash
    console.log('✅ 签名生成成功:', hash)

    console.log('🌐 开始构建请求URL')
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')

    const requestUrl = `${gateway}?${queryString}`
    console.log('请求URL:', requestUrl)

    console.log('📡 开始请求虎皮椒API')
    try {
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      console.log('📡 收到响应，状态码:', response.status)
      
      if (!response.ok) {
        console.error('❌ 虎皮椒接口请求失败:', response.status)
        throw new Error(`虎皮椒接口请求失败: ${response.status}`)
      }

      const responseText = await response.text()
      console.log('响应文本:', responseText.substring(0, 500))
      let result: any

      try {
        result = JSON.parse(responseText)
        console.log('✅ JSON解析成功:', result)
      } catch (parseError) {
        console.warn('⚠️  虎皮椒返回的不是JSON，使用备用方案:', responseText.substring(0, 200))
        console.log('✅ 使用备用方案返回')
        return NextResponse.json({
          success: true,
          paymentUrl: requestUrl,
          orderId: tradeOrderId,
          message: '支付链接生成成功（备用模式）'
        })
      }

      console.log('虎皮椒API响应:', result)

      const paymentUrl = result.url || result.qrcode || result.pay_url || requestUrl
      console.log('支付URL:', paymentUrl)
      
      const finalOrderId = result.trade_order_id || result.orderId || result.id || tradeOrderId
      console.log('最终订单ID:', finalOrderId)
      
      try {
        createOrder(finalOrderId)
        console.log('✅ 订单再次创建成功')
      } catch (orderError) {
        console.warn('⚠️  再次创建订单失败（可能已存在）:', orderError)
      }

      console.log('✅ 支付订单创建成功')
      return NextResponse.json({
        success: true,
        paymentUrl,
        orderId: finalOrderId,
        message: '支付链接生成成功',
        rawResponse: result
      })

    } catch (error) {
      console.error('❌ 请求虎皮椒API失败:', error)
      throw error
    }

  } catch (error) {
    console.error('💥 整个支付流程错误:', error)
    return NextResponse.json(
      { error: '创建支付订单失败' },
      { status: 500 }
    )
  }
}
