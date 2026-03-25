import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { updateOrderStatus } from '@/lib/orderStore'

function verifySign(params: Record<string, string>, appSecret: string, receivedHash: string): boolean {
  const signParams: Record<string, string> = {}
  
  Object.keys(params)
    .filter(key => key !== 'hash' && params[key] !== '')
    .forEach(key => {
      signParams[key] = params[key]
    })
  
  const sortedKeys = Object.keys(signParams).sort()
  
  const signString = sortedKeys
    .map(key => `${key}=${signParams[key]}`)
    .join('&') + appSecret
  
  const calculatedHash = crypto.createHash('md5').update(signString).digest('hex')
  
  return calculatedHash === receivedHash
}

export async function POST(request: NextRequest) {
  try {
    const appSecret = process.env.XUNHU_APPSECRET

    if (!appSecret) {
      return new NextResponse('fail', { status: 500 })
    }

    const formData = await request.formData()
    const params: Record<string, string> = {}
    
    formData.forEach((value, key) => {
      params[key] = value.toString()
    })

    const receivedHash = params.hash

    if (!receivedHash) {
      return new NextResponse('fail', { status: 400 })
    }

    const isValid = verifySign(params, appSecret, receivedHash)

    if (!isValid) {
      console.error('支付回调签名验证失败')
      return new NextResponse('fail', { status: 400 })
    }

    const tradeOrderId = params.trade_order_id
    const status = params.status
    const payTime = params.pay_time
    const totalFee = params.total_fee

    console.log('支付回调成功:', {
      tradeOrderId,
      status,
      payTime,
      totalFee
    })

    if (status === 'OD') {
      console.log('订单支付成功:', tradeOrderId)
      updateOrderStatus(tradeOrderId, 'paid')
    }

    return new NextResponse('success', { 
      status: 200,
      headers: {
        'Content-Type': 'text/plain'
      }
    })

  } catch (error) {
    console.error('支付回调处理错误:', error)
    return new NextResponse('fail', { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const appSecret = process.env.XUNHU_APPSECRET

    if (!appSecret) {
      return new NextResponse('fail', { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const params: Record<string, string> = {}
    
    searchParams.forEach((value, key) => {
      params[key] = value
    })

    const receivedHash = params.hash

    if (!receivedHash) {
      return new NextResponse('fail', { status: 400 })
    }

    const isValid = verifySign(params, appSecret, receivedHash)

    if (!isValid) {
      console.error('同步返回签名验证失败')
      return new NextResponse('fail', { status: 400 })
    }

    const tradeOrderId = params.trade_order_id
    const status = params.status

    console.log('同步返回成功:', {
      tradeOrderId,
      status
    })

    return NextResponse.redirect(new URL('/order', request.url))

  } catch (error) {
    console.error('同步返回处理错误:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}
