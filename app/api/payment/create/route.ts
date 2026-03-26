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

    const params: Record&lt;string, string&gt; = {
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
      .map(key =&gt; `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&amp;')

    const paymentUrl = `https://api.xunhupay.com/payment/do.html?${queryString}`
    console.log('✅ 支付URL生成成功:', paymentUrl)

    console.log('📡 开始请求虎皮椒API...')
    const response = await fetch(paymentUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    console.log('📡 虎皮椒响应状态码:', response.status)
    const responseText = await response.text()
    console.log('📦 虎皮椒原始响应:', responseText)

    let result
    try {
      result = JSON.parse(responseText)
      console.log('✅ 虎皮椒JSON解析成功:', result)
    } catch (e) {
      console.error('❌ 虎皮椒返回的不是JSON:', responseText)
      return NextResponse.json({
        errcode: -1,
        error: '虎皮椒返回格式错误'
      }, { status: 500 })
    }

    console.log('🚀 原封不动返回虎皮椒响应')
    return NextResponse.json(result)

  } catch (error) {
    console.error('💥 整个支付流程错误:', error)
    return NextResponse.json(
      { errcode: -1, error: '创建支付订单失败' },
      { status: 500 }
    )
  }
}
