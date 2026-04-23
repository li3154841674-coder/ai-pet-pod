import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: "请上传宠物图片" }, { status: 400 });
    }

    const apiKey = process.env.COMFLY_API_KEY || process.env.OPENAI_API_KEY;
    console.log("🔍 环境变量检查:");
    console.log("  - COMFLY_API_KEY 是否存在:", !!process.env.COMFLY_API_KEY);
    console.log("  - OPENAI_API_KEY 是否存在:", !!process.env.OPENAI_API_KEY);
    console.log("Key Loaded Length:", apiKey?.length || 0);

    if (!apiKey) {
      return NextResponse.json({ error: "API Key 未配置，请在 Vercel 后台设置 COMFLY_API_KEY 或 OPENAI_API_KEY" }, { status: 500 });
    }

    // 强制清理可能干扰 HTTPS 直连的代理环境变量
    delete process.env.https_proxy;
    delete process.env.http_proxy;
    delete process.env.HTTPS_PROXY;
    delete process.env.HTTP_PROXY;

    console.log("=" .repeat(60));
    console.log("🎨 AI 宠物服装定制 - 开始生成 (Comfly)");
    console.log("=" .repeat(60));

    // 1. 恢复完美商业级 Prompt
    const brandPrompt = `Transform the pet in the reference image into a highly detailed Tarot card character, specifically [RANDOM_TAROT_CHARACTER]. Carefully preserve the core facial features and species of the pet.
Art Style: The signature aesthetic of Alphonse Mucha, blending ornate Art Nouveau with medieval occult print-making.
Composition & Details: Encircle the pet with intricate vintage filigree, symmetrical floral borders, and celestial symbols (sun, moon, and stars). Integrate elements and symbols that explicitly represent the character [RANDOM_TAROT_CHARACTER] into the design. Symmetrical, balanced composition.
Technical Requirements (Crucial for Printing): The subject must be completely isolated on a pure, solid, white (#FFFFFF) void background, with zero shading, gradients, or ambient noise. The style must be a flat vector-like illustration with clean, crisp, sharp dark outlines. This design is optimized for direct-to-garment (DTG) T-shirt printing.`;

    const tarotCharacters = ["The Sun", "The Moon", "The Magician", "The Star", "The Empress"];
    const pickedTarot = tarotCharacters[Math.floor(Math.random() * tarotCharacters.length)];
    const finalPrompt = brandPrompt.replaceAll("[RANDOM_TAROT_CHARACTER]", pickedTarot);

    // 2. 按官方文档重构请求体
    const targetUrl = "https://ai.comfly.chat/v1/images/generations";
    const requestPayload = {
      model: "gpt-image-2",
      prompt: finalPrompt,
      size: "1024x1024",
      image: [image],
    };
    console.log("📦 最终 Payload:", JSON.stringify(requestPayload, null, 2));
    const requestBody = JSON.stringify(requestPayload);

    // 3. 按照原有的逻辑发送 fetch 请求到 https://ai.comfly.chat/v1/images/generations
    console.log("📡 调用 API:", targetUrl);
    console.log("🎯 使用模型:", requestPayload.model);
    console.log("✨ 提示词已加载 (长度:", finalPrompt.length, "字符)");
    console.log("🃏 本次塔罗角色:", pickedTarot);
    console.log("🖼️ 图片输入长度:", typeof image === "string" ? image.length : 0);
    console.log("🎯 [Debug] Target URL:", targetUrl);
    console.log("📦 [Debug] Model Requested:", requestPayload.model);
    console.log("🔑 [Debug] API Key length:", apiKey.length, " Starts with:", apiKey.substring(0, 3));

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: requestBody
    });

    console.log("📡 [Debug] Response Status:", response.status);

    if (!response.ok) {
      const rawError = await response.text();
      console.error("🚨 [AI 生成失败] 非 2xx 响应");
      console.error("status:", response.status, response.statusText);
      console.error("rawError:", rawError);

      let parsedError: any = {};
      try {
        parsedError = JSON.parse(rawError);
      } catch {
        parsedError = {};
      }

      console.error("parsedError:", parsedError);
      console.error("requestPayload:", { ...requestPayload, image: typeof image === "string" ? `[base64:${image.length}]` : typeof image });
      return NextResponse.json({ error: parsedError?.error?.message || parsedError?.error || rawError || "AI 画师正在摸鱼，请稍后再试" }, { status: response.status });
    }

    const data = await response.json();
    console.log("✅ API 响应:", JSON.stringify(data, null, 2));

    const newImageUrl = data.data?.[0]?.url;

    if (!newImageUrl) {
      console.error("❌ 未能获取到图片 URL");
      console.error("response data:", data);
      console.error("requestPayload:", { ...requestPayload, image: typeof image === "string" ? `[base64:${image.length}]` : typeof image });
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
    const err = error as Error & { code?: string; cause?: unknown }
    console.error("error.name:", err?.name || "Unknown")
    console.error("error.message:", err?.message || "Unknown error")
    console.error("error.stack:", err?.stack || "No stack")
    console.error("error.code:", err?.code || "No code")
    console.error("error.cause:", err?.cause || "No cause")
    if (err?.message?.includes("ECONNREFUSED") || err?.code === "ECONNREFUSED") {
      console.error("⚠️ 检测到 ECONNREFUSED，可能存在代理/本地网络拦截或目标端口不可达")
    }
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
