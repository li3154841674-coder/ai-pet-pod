import { NextRequest, NextResponse } from 'next/server'

const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
}

interface OrderData {
  amount: number
  productName: string
  petName?: string
  paymentMethod: 'wechat' | 'alipay'
  shippingData: {
    name: string
    phone: string
    address: string
  }
}

interface PaymentResponse {
  orderId: string
  payUrl: string
  qrCode: string
  status: string
}

const createSignature = (data: Record<string, any>, secret: string): string => {
  const sortedKeys = Object.keys(data).sort()
  const signString = sortedKeys
    .map(key => `${key}=${data[key]}`)
    .join('&') + `&key=${secret}`
  
  return btoa(signString)
}

const createPaymentOrder = async (orderData: OrderData, appId: string, appSecret: string): Promise<PaymentResponse> => {
  const timestamp = Date.now()
  const orderId = `ORD${timestamp}${Math.random().toString(36).substr(2, 4).toUpperCase()}`

  const requestData = {
    app_id: appId,
    order_id: orderId,
    amount: (orderData.amount * 100).toFixed(0),
    product_name: orderData.productName,
    payment_method: orderData.paymentMethod,
    notify_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook`,
    timestamp,
  }

  const sign = createSignature(requestData, appSecret)

  try {
    const mockResponse = {
      orderId,
      payUrl: `https://mock.payment.gateway/pay/${orderId}`,
      qrCode: `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          <rect width="200" height="200" fill="white"/>
          <rect x="20" y="20" width="160" height="160" fill="none" stroke="#000" stroke-width="2"/>
          <text x="100" y="110" text-anchor="middle" font-size="12" fill="#333">模拟二维码</text>
          <text x="100" y="130" text-anchor="middle" font-size="10" fill="#666">${orderId}</text>
        </svg>
      `)}`,
      status: ORDER_STATUS.PENDING,
    }

    return mockResponse

  } catch (error) {
    console.error('Payment gateway error:', error)
    throw new Error('Failed to create payment order')
  }
}

export async function POST(request: NextRequest) {
  try {
    const appId = process.env.PAY_APP_ID
    const appSecret = process.env.PAY_APP_SECRET

    if (!appId || !appSecret) {
      return NextResponse.json(
        { error: 'Payment credentials not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { amount, productName, petName, paymentMethod, shippingData }: OrderData = body

    if (!amount || !productName || !paymentMethod || !shippingData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const paymentResponse = await createPaymentOrder(
      { amount, productName, petName, paymentMethod, shippingData },
      appId,
      appSecret
    )

    return NextResponse.json(paymentResponse)

  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
