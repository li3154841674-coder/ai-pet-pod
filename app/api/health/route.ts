import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const appId = process.env.XUNHU_APPID
    const appSecret = process.env.XUNHU_APPSECRET
    const gateway = process.env.XUNHU_GATEWAY
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    console.log('健康检查 - 环境变量:', {
      hasAppId: !!appId,
      hasAppSecret: !!appSecret,
      hasGateway: !!gateway,
      siteUrl
    })

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        hasAppId: !!appId,
        hasAppSecret: !!appSecret,
        hasGateway: !!gateway,
        siteUrl,
        nodeEnv: process.env.NODE_ENV
      },
      message: '健康检查成功'
    })
  } catch (error) {
    console.error('健康检查错误:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: '健康检查失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}