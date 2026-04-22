import { NextRequest, NextResponse } from 'next/server'

function normalizeTimeline(payload: any) {
  const candidates = [
    payload?.data?.list,
    payload?.data?.trace,
    payload?.result?.list,
    payload?.result?.trace,
    payload?.timeline,
    payload?.data,
  ]

  const rawList = candidates.find((item) => Array.isArray(item)) || []

  return rawList
    .map((item: any) => ({
      time: item.time || item.datetime || item.acceptTime || item.accept_time || '',
      location: item.location || item.address || item.zone || item.company || '',
      status: item.status || item.context || item.description || item.remark || item.desc || '',
    }))
    .filter((item: any) => item.time || item.location || item.status)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const trackingNumber = typeof body?.trackingNumber === 'string' ? body.trackingNumber.trim() : ''
    const company = typeof body?.company === 'string' ? body.company.trim() : ''

    if (!trackingNumber) {
      return NextResponse.json({
        success: true,
        timeline: [],
        message: '您的专属高定已进入精密制作流程，物流信息即将为您实时呈现...',
      })
    }

    const appCode = process.env.ALIYUN_LOGISTICS_APP_CODE
    if (!appCode) {
      return NextResponse.json({ error: 'ALIYUN_LOGISTICS_APP_CODE 未配置' }, { status: 500 })
    }

    const apiUrl = process.env.ALIYUN_LOGISTICS_API_URL || 'https://ali-deliver.showapi.com/getExpressInfo'
    const url = new URL(apiUrl)
    url.searchParams.set('nu', trackingNumber)
    if (company) url.searchParams.set('com', company)

    const upstream = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `APPCODE ${appCode}`,
        Accept: 'application/json',
      },
    })

    const data = await upstream.json().catch(async () => ({ raw: await upstream.text().catch(() => '') }))

    if (!upstream.ok) {
      return NextResponse.json(
        {
          success: true,
          timeline: [],
          message: '您的专属高定已进入精密制作流程，物流信息即将为您实时呈现...',
          raw: data,
        },
        { status: 200 },
      )
    }

    const timeline = normalizeTimeline(data)

    return NextResponse.json({
      success: true,
      timeline: timeline.length
        ? timeline
        : [],
      message: timeline.length ? '' : '您的专属高定已进入精密制作流程，物流信息即将为您实时呈现...',
      raw: data,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: true,
        timeline: [],
        message: '您的专属高定已进入精密制作流程，物流信息即将为您实时呈现...',
      },
      { status: 200 },
    )
  }
}
