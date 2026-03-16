import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image } = body; 

    if (!image) {
      return NextResponse.json({ error: "请上传宠物图片" }, { status: 400 });
    }

    const apiKey = process.env.COMFLY_API_KEY;
    console.log("🔍 环境变量检查:");
    console.log("  - COMFLY_API_KEY 是否存在:", !!apiKey);
    console.log("  - COMFLY_API_KEY 长度:", apiKey?.length || 0);
    
    if (!apiKey) {
      return NextResponse.json({ error: "API Key 未配置，请在 Vercel 后台设置 COMFLY_API_KEY" }, { status: 500 });
    }

    console.log("=" .repeat(60));
    console.log("🎨 AI 宠物服装定制 - 开始生成 (Comfly)");
    console.log("=" .repeat(60));

    const brandPrompt = "A customized illustration, based on a total artistic recreation of the uploaded pet, maintaining its core facial features but adapting its pose to be lying flat on its stomach. The pet is wearing a traditional Chinese red quilted vest, detailed with repeating golden coin patterns. The entire scene is rendered in a hand-painted texture style, with subtle color bleeding into fabric, vintage aesthetic, minimalist high-fashion composition. The pet is surrounded by fewer, more elegant stylized Chinese auspicious clouds and several perfectly formed floating dumplings, creating significant negative space to emphasize the animal. The color palette is strictly restricted to vermilion red, emerald green, and rich gold, creating a retro and festive atmosphere. The overall vibe is humorous, quirky, ugly-cute, folk art aesthetic, representing a 'Tangping' (lying flat) lifestyle. No text. Isolated on a pure #FFFFFF white background. No frames, no borders, minimal shadows, flat but textured art style. The entire illustration must be a clean element floating on an absolute pure white empty space.";

    const payload = {
      model: "gemini-3.1-flash-image-preview",
      prompt: brandPrompt,
      image: image, 
      strength: 0.65, 
      n: 1,
      response_format: "url"
    };

    console.log("📡 调用 API:", "https://ai.comfly.chat/v1/images/generations");
    console.log("🎯 使用模型:", payload.model);
    console.log("✨ 提示词已加载 (长度:", brandPrompt.length, "字符)");

    const response = await fetch("https://ai.comfly.chat/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ 第三方 API 调用失败:", errorData);
      return NextResponse.json({ error: errorData?.error?.message || "AI 画师正在摸鱼，请稍后再试" }, { status: response.status });
    }

    const data = await response.json();
    console.log("✅ API 响应:", JSON.stringify(data, null, 2));

    const newImageUrl = data.data?.[0]?.url;

    if (!newImageUrl) {
      console.error("❌ 未能获取到图片 URL");
      return NextResponse.json({ error: "未能获取到生成的图片，请重试" }, { status: 500 });
    }

    console.log("🎉 图片生成成功!");
    console.log("🖼️  图片 URL:", newImageUrl);
    console.log("=" .repeat(60));

    return NextResponse.json({ 
      success: true,
      imageUrl: newImageUrl,
      url: newImageUrl
    });

  } catch (error) {
    console.error("=" .repeat(60));
    console.error("💥 生成接口发生异常");
    console.error("=" .repeat(60));
    console.error("错误详情:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
