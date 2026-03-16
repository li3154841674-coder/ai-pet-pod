import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { image, prompt } = body

    if (!image) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      )
    }

    console.log("=" .repeat(60))
    console.log("第三方 API 调用开始")
    console.log("=" .repeat(60))

    // ============================================
    // TODO: 替换为你的第三方 API 真实 URL 地址
    // 请查看你的第三方 API 文档，找到正确的 API 端点
    // 示例: "https://api.example.com/v1/generate"
    // ============================================
    const THIRD_PARTY_API_URL = "https://api.your-third-party.com/v1/generate"

    // ============================================
    // TODO: 配置请求头 (Headers)
    // 根据你的第三方 API 文档配置正确的请求头
    // 通常需要 Authorization: Bearer ${process.env.THIRD_PARTY_API_KEY}
    // ============================================
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.THIRD_PARTY_API_KEY}`,
      // TODO: 如果你的 API 需要其他特殊请求头，请在这里添加
      // "X-API-Key": process.env.THIRD_PARTY_API_KEY,
    }

    // ============================================
    // TODO: 根据第三方 API 的官方文档，组装正确的请求体 (Body) 格式
    // 请参考你的第三方 API 文档，了解他们需要什么格式的请求体
    // 下面是一些常见的格式示例，选择一个适合你的，或者完全重写
    // ============================================
    
    // 格式示例 1: 图像到图像生成 (img2img)
    const requestBody = {
      image: image,
      prompt: prompt || "cute pet portrait, pop art style",
      // TODO: 根据你的 API 文档添加其他必需参数
      // strength: 0.65,
      // guidance_scale: 8,
      // num_inference_steps: 30,
      // width: 768,
      // height: 768,
    }

    // 格式示例 2: 文生图 + 参考图 (如果你的 API 需要这种格式)
    // const requestBody = {
    //   prompt: prompt || "cute pet portrait",
    //   image: image,
    //   mode: "image-to-image",
    //   // TODO: 添加其他参数
    // }

    console.log("请求 URL:", THIRD_PARTY_API_URL)
    console.log("请求头:", JSON.stringify(headers, null, 2))
    console.log("请求体:", JSON.stringify(requestBody, null, 2))

    const response = await fetch(THIRD_PARTY_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("第三方 API 错误响应:", response.status, errorText)
      throw new Error(`第三方 API 调用失败: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("第三方 API 响应:", JSON.stringify(data, null, 2))

    // ============================================
    // TODO: 根据第三方 API 的响应格式，提取图片 URL
    // 不同的 API 返回格式不同，请根据实际情况修改
    // ============================================
    let imageUrl = ""

    // 响应格式示例 1: 直接返回图片 URL 字符串
    if (typeof data === "string") {
      imageUrl = data
    }
    // 响应格式示例 2: { image_url: "..." }
    else if (data.image_url) {
      imageUrl = data.image_url
    }
    // 响应格式示例 3: { output: ["url1", "url2"] }
    else if (data.output && Array.isArray(data.output) && data.output.length > 0) {
      imageUrl = data.output[0]
    }
    // 响应格式示例 4: { images: ["url1"] }
    else if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      imageUrl = data.images[0]
    }
    // 响应格式示例 5: { data: [{ url: "..." }] }
    else if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      imageUrl = data.data[0].url || data.data[0].image
    }
    // TODO: 如果以上都不匹配，请根据你的 API 文档添加正确的提取逻辑
    else {
      console.error("无法从响应中提取图片 URL，原始响应:", data)
      throw new Error("无法解析第三方 API 响应格式，请检查代码中的 TODO 部分")
    }

    if (!imageUrl) {
      throw new Error("第三方 API 未返回图片 URL")
    }

    console.log("提取的图片 URL:", imageUrl)
    console.log("=" .repeat(60))

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      originalResponse: data,
    })

  } catch (error) {
    console.error("=" .repeat(60))
    console.error("第三方 API 调用错误")
    console.error("=" .repeat(60))
    console.error("错误详情:", error)

    let errorMessage = "第三方 API 调用失败"
    
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
