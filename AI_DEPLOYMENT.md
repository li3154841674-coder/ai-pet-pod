# AI 绘图 API 部署配置指南

## 📋 目录
- [快速开始](#快速开始)
- [API 配置](#api-配置)
- [提示词定制](#提示词定制)
- [模型选择](#模型选择)
- [参数调优](#参数调优)
- [常见问题](#常见问题)

---

## 🚀 快速开始

### 1. 获取 Replicate API Token

1. 访问 [Replicate 官网](https://replicate.com)
2. 注册/登录账号
3. 进入 [API Tokens 页面](https://replicate.com/account/api-tokens)
4. 点击 "Create Token" 创建新的 API Token
5. 复制你的 Token（格式：`r8_...`）

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# Replicate API Key
REPLICATE_API_TOKEN=r8_你的token在这里

# 网站 URL (生产环境)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

---

## 🎨 API 配置

### 配置文件位置
`app/api/generate/route.ts`

### 当前配置（AI_CONFIG）

```typescript
const AI_CONFIG = {
  prompt: "adorable pet portrait, pop art style, vibrant saturated colors, highly detailed, 8k resolution, professional digital illustration, clean white background, fashion t-shirt design, masterpiece quality",
  negativePrompt: "blurry, low quality, distorted, bad anatomy, extra limbs, watermark, text, ugly, deformed, nsfw, cartoon, 2d, flat, lowres, pixelated, grainy, noise",
  denoisingStrength: 0.65,
  guidanceScale: 8,
  inferenceSteps: 35,
  width: 768,
  height: 768,
}
```

---

## ✍️ 提示词定制

### 如何修改提示词

编辑 `app/api/generate/route.ts` 中的 `AI_CONFIG.prompt`：

### 提示词建议

#### 波普艺术风格（当前）
```
adorable pet portrait, pop art style, vibrant saturated colors, highly detailed, 8k resolution, professional digital illustration, clean white background, fashion t-shirt design, masterpiece quality
```

#### 水彩风格
```
cute pet portrait, watercolor painting style, soft pastel colors, delicate brush strokes, artistic, trending on artstation, clean white background
```

#### 赛博朋克风格
```
cyberpunk pet portrait, neon lights, futuristic, highly detailed, digital art, vibrant colors, clean white background
```

#### 油画风格
```
pet portrait, oil painting style, rich textures, classical art, detailed brushwork, warm colors, clean white background
```

#### 像素艺术风格
```
pixel art pet portrait, retro style, 16-bit, vibrant colors, clean white background
```

### 负面提示词（Negative Prompt）

负面提示词用于避免不想要的效果：

```
blurry, low quality, distorted, bad anatomy, extra limbs, watermark, text, ugly, deformed, nsfw, cartoon, 2d, flat, lowres, pixelated, grainy, noise
```

你可以根据需要添加更多：
- `bad hands` - 避免糟糕的手部
- `extra fingers` - 避免多余的手指
- `mutated` - 避免变异
- `disfigured` - 避免毁容

---

## 🤖 模型选择

### 可用模型

编辑 `app/api/generate/route.ts` 中的 `CURRENT_MODEL`：

```typescript
const CURRENT_MODEL = MODEL_OPTIONS.stableDiffusion  // 或其他选项
```

### 模型对比

| 模型 | 速度 | 质量 | 成本 | 推荐场景 |
|------|------|------|------|----------|
| **Stable Diffusion** | ⭐⭐⭐ | ⭐⭐⭐ | 低 | 日常使用，平衡选择 |
| **SDXL** | ⭐⭐ | ⭐⭐⭐⭐ | 中 | 高质量需求 |
| **Flux Dev** | ⭐ | ⭐⭐⭐⭐⭐ | 高 | 最佳质量 |

### 模型配置

```typescript
const MODEL_OPTIONS = {
  // Stable Diffusion v1.5 - 平衡之选
  stableDiffusion: "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa751651057c8a4531136e149635",
  
  // SDXL - 更高质量
  sdxl: "stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bd",
  
  // Flux Dev - 最新最强
  fluxDev: "black-forest-labs/flux-dev:f63844659a9e3e60454f9fa065410206d95bb423b87f7560393775edc2a5c72",
}
```

---

## ⚙️ 参数调优

### denoisingStrength（去噪强度）
- **范围**: 0.1 - 1.0
- **当前**: 0.65
- **说明**: 
  - 越低 = 越保留原图特征
  - 越高 = 越自由创作
- **推荐**:
  - 0.4-0.6: 保留更多原图
  - 0.6-0.8: 平衡效果
  - 0.8-1.0: 完全重绘

### guidanceScale（引导强度）
- **范围**: 1 - 20
- **当前**: 8
- **说明**: 控制 AI 遵守提示词的程度
- **推荐**: 7-10

### inferenceSteps（推理步数）
- **范围**: 10 - 50
- **当前**: 35
- **说明**: 越多 = 质量越好但越慢
- **推荐**: 25-40

### width / height（尺寸）
- **当前**: 768x768
- **选项**: 512, 768, 1024
- **注意**: 更大尺寸 = 更慢更贵

---

## 🔍 常见问题

### Q: 生成的图片和原图不像怎么办？
**A**: 降低 `denoisingStrength`（比如 0.4-0.5）

### Q: 图片质量不够好怎么办？
**A**: 
1. 增加 `inferenceSteps`（比如 40-50）
2. 尝试 SDXL 或 Flux 模型
3. 增加 `width`/`height`

### Q: 生成速度太慢怎么办？
**A**:
1. 改用 Stable Diffusion 模型
2. 减少 `inferenceSteps`（比如 20-25）
3. 降低尺寸到 512x512

### Q: 如何查看生成日志？
**A**: 查看终端输出，会打印详细的配置信息

### Q: 没有配置 API Token 也能用吗？
**A**: 可以！会进入演示模式，直接返回你上传的图片

---

## 💡 进阶技巧

### 1. 测试不同提示词
在浏览器开发者工具的 Network 面板中查看请求和响应

### 2. 监控成本
访问 [Replicate Dashboard](https://replicate.com/dashboard) 查看使用量

### 3. 备份好的配置
保存你喜欢的提示词和参数组合

### 4. 分批测试
先测试小批量，找到满意的配置后再大量使用

---

## 📞 获取帮助

- Replicate 文档: https://replicate.com/docs
- Stable Diffusion 提示词指南: https://stable-diffusion-art.com/prompt-guide/
- 项目 Issues: 在 GitHub 提交问题

---

**祝你创作愉快！🎨**
