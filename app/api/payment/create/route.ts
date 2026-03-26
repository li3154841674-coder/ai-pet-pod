import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

function generateNonceStr(): string {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

function generateSign(params: Record<string, string>, appSecret: string): string {
  const sortedKeys = Object.keys(params).sort()
  
  const signString = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&') + appSecret
  
  return crypto.createHash('md5').update(signString).digest('hex').toLowerCase()
}

export async function POST(request: NextRequest) {
  console.log('🚀 虎皮椒支付API被调用')
  
  try {
    const appId = '201906178015'
    const appSecret = process.env.XUNHU_APPSECRET
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cocoshop.art'

    console.log('环境变量检查:', {
      appId,
      hasAppSecret: !!appSecret,
      siteUrl
    })

    if (!appSecret) {
      console.error('❌ 虎皮椒密钥未配置')
      return NextResponse.json(
        { error: '虎皮椒密钥未配置' },
        { status: 500 }
      )
    }

    const tradeOrderId = `${Date.now()}${Math.random().toString(36).substr(2, 8)}`
    console.log('订单ID:', tradeOrderId)

    const params: Record<string, string> = {
      appid: appId,
      trade_order_id: tradeOrderId,
      total_fee: '69.90',
      title: '观象高定宠物服装',
      time: Math.floor(Date.now() / 1000).toString(),
      notify_url: `${siteUrl}/api/payment/notify`,
      return_url: `${siteUrl}/success`,
      nonce_str: generateNonceStr(),
      type: 'alipay',
      wap_url: siteUrl,
      wap_name: '观象'
    }

    console.log('签名参数（排序前）:', params)
    
    const hash = generateSign(params, appSecret)
    params.hash = hash
    console.log('✅ 签名生成成功:', hash)
    console.log('签名参数（排序后+hash）:', params)

    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')

    const paymentUrl = `https://api.xunhupay.com/payment/do.html?${queryString}`
    console.log('✅ 支付URL生成成功:', paymentUrl)

    return NextResponse.json({
      success: true,
      url: paymentUrl,
      paymentUrl: paymentUrl,
      orderId: tradeOrderId,
      message: '支付链接生成成功'
    })

  } catch (error) {
    console.error('💥 整个支付流程错误:', error)
    return NextResponse.json(
      { error: '创建支付订单失败' },
      { status: 500 }
    )
  }
}
