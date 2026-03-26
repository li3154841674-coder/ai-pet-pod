import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

type CreatePaymentRequestBody = {
  title?: string
  totalFee?: number | string
}

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
  const signString = sortedKeys.map((key) => `${key}=${params[key]}`).join('&') + appSecret
  return crypto.createHash('md5').update(signString).digest('hex').toLowerCase()
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as CreatePaymentRequestBody

    const title =
      typeof body.title === 'string' && body.title.trim() ? body.title.trim() : '观象高定宠物服装'

    const totalFeeNumber = typeof body.totalFee === 'string' ? Number(body.totalFee) : body.totalFee
    const totalFee = Number.isFinite(totalFeeNumber) && totalFeeNumber! > 0 ? totalFeeNumber! : 69.9

    const appId = process.env.XUNHU_APPID || '201906178015'
    const appSecret = process.env.XUNHU_APPSECRET
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cocoshop.art'
    const gateway = process.env.XUNHU_GATEWAY || 'https://api.xunhupay.com/payment/do.html'

    if (!appSecret) {
      return NextResponse.json({ errcode: -1, error: '虎皮椒密钥未配置' }, { status: 500 })
    }

    const tradeOrderId = `${Date.now()}${Math.random().toString(36).substr(2, 8)}`

    const params: Record<string, string> = {
      appid: appId,
      trade_order_id: tradeOrderId,
      total_fee: totalFee.toFixed(2),
      title,
      time: Math.floor(Date.now() / 1000).toString(),
      notify_url: `${siteUrl}/api/payment/notify`,
      return_url: `${siteUrl}/success`,
      nonce_str: generateNonceStr(),
      type: 'alipay',
      wap_url: siteUrl,
      // 虎皮椒可能限制长度，这里保守截断
      wap_name: title.slice(0, 32),
    }

    // 严格要求：MD5 签名与 POST 请求都在后端完成
    const hash = generateSign(params, appSecret)
    params.hash = hash

    const formBody = new URLSearchParams(params).toString()
    const upstreamRes = await fetch(gateway, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
    })

    const responseText = await upstreamRes.text()
    if (!upstreamRes.ok) {
      return NextResponse.json(
        {
          errcode: upstreamRes.status,
          error: '虎皮椒下单失败',
          raw: responseText.slice(0, 200),
        },
        { status: 502 }
      )
    }

    let upstream: any
    try {
      upstream = JSON.parse(responseText)
    } catch {
      return NextResponse.json(
        { errcode: -2, error: '虎皮椒返回不是 JSON', raw: responseText.slice(0, 200) },
        { status: 502 }
      )
    }

    const errcode = typeof upstream?.errcode === 'number' ? upstream.errcode : 0
    const url = upstream?.url || upstream?.paymentUrl

    if (errcode !== 0 || !url) {
      return NextResponse.json(
        {
          errcode: errcode !== 0 ? errcode : -3,
          errmsg: upstream?.errmsg || upstream?.error || '虎皮椒返回异常',
          orderId: tradeOrderId,
          url: null,
        },
        { status: 200 }
      )
    }

    return NextResponse.json({
      errcode,
      errmsg: upstream?.errmsg,
      url,
      paymentUrl: url,
      orderId: tradeOrderId,
    })
  } catch (error) {
    return NextResponse.json({ errcode: -1, error: '创建支付订单失败' }, { status: 500 })
  }
}
