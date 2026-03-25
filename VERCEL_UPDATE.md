# Vercel 项目更新部署指南

## 已完成的更新内容

### 1. ✅ 支付状态检测修复
- 修改了订单状态查询API，主动向虎皮椒API查询真实订单状态
- 不再仅依赖webhook回调，支持本地开发环境检测支付状态

### 2. ✅ UI遮挡问题修复
- 移除了二维码中心的遮挡元素
- 将状态栏重构到二维码下方
- 保留所有关键信息（订单号、支付提示）
- 维持毛玻璃视觉效果和响应式适配

### 3. ✅ 环境变量配置
- 创建了完整的`.env.example`文件
- 更新了`.gitignore`以允许提交示例配置文件

---

## Vercel 项目更新步骤

### 步骤 1: 提交并推送代码到远程仓库

```bash
# 检查当前状态
git status

# 提交更改
git commit -m "feat: 修复支付状态检测和UI遮挡问题

- 添加主动查单功能，支持本地环境支付状态检测
- 修复二维码中心遮挡问题，重构状态栏布局
- 添加完整的环境变量示例配置"

# 推送到远程仓库
git push origin master
```

### 步骤 2: Vercel 自动部署

Vercel 会自动检测到代码推送并触发部署。

### 步骤 3: 验证环境变量配置（如需要）

在 Vercel Dashboard 中确认以下环境变量已正确配置：

| 变量名 | 说明 |
|--------|------|
| `COMFLY_API_KEY` | AI生成API密钥 |
| `XUNHU_APPID` | 虎皮椒AppID |
| `XUNHU_APPSECRET` | 虎皮椒AppSecret |
| `XUNHU_GATEWAY` | 虎皮椒API网关 |
| `NEXT_PUBLIC_SITE_URL` | 你的网站域名 |

**注意**：环境变量会在更新中自动保留，无需重新配置。

### 步骤 4: 监控部署进度

1. 访问 [vercel.com/dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 查看部署状态（Deployments 标签）
4. 等待部署完成（通常 1-3 分钟）

### 步骤 5: 验证线上功能

部署成功后，验证以下功能：

1. **AI生成功能** - 测试图片上传和AI生成
2. **支付弹窗** - 确认二维码无遮挡，状态栏显示正常
3. **支付流程** - 测试支付状态轮询功能
4. **响应式布局** - 在不同设备上测试显示效果

---

## 本地验证（更新前）

在推送代码前，确保已完成以下本地验证：

```bash
# 1. 安装依赖（如需要）
npm install

# 2. 运行构建测试
npm run build

# 3. 启动本地服务器测试
npm start
```

---

## 回滚方案（如需要）

如果更新出现问题，可以快速回滚：

### 方法 1: Vercel Dashboard 回滚
1. 进入项目 Deployments 页面
2. 找到之前成功的部署
3. 点击 "..." → "Promote to Production"

### 方法 2: Git 回滚
```bash
# 回退到上一个提交
git revert HEAD
git push origin master
```

---

## 常见问题

### Q: 部署后环境变量丢失了？
A: Vercel 会保留之前配置的环境变量，无需重新设置。

### Q: 如何确认部署是否成功？
A: 在 Vercel Dashboard 的 Deployments 标签中查看状态，绿色勾号表示成功。

### Q: 部署失败怎么办？
A: 查看部署日志（Deployment → View Logs），根据错误信息排查问题。
