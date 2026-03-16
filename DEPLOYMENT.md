# 一键部署指南

## 🚀 最简单的方式：Vercel 一键部署

### 方法 1：使用 Vercel Dashboard（推荐）

1. **将代码推送到 GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin <你的仓库地址>
   git push -u origin main
   ```

2. **访问 [vercel.com](https://vercel.com)**
   - 登录或注册账号
   - 点击 "New Project"
   - 导入你的 GitHub 仓库
   - 配置环境变量（参考 `.env.example`）：
     - `COMFLY_API_KEY`：你的 Comfly API Key
   - 点击 "Deploy"

3. **完成！** 几分钟后你的网站就上线了

### 方法 2：使用 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录并部署**
   ```bash
   vercel login
   vercel
   ```

3. **按照提示操作即可完成部署**

---

## 环境变量配置

在部署前，请确保设置以下环境变量：

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `COMFLY_API_KEY` | Comfly AI API 密钥 | ✅ |

---

## 其他部署选项

### Netlify
1. 访问 [netlify.com](https://netlify.com)
2. 导入 GitHub 仓库
3. 配置环境变量
4. 部署

### Docker
构建 Docker 镜像并部署到任何支持 Docker 的平台。

### VPS
使用 `npm run build` 构建后，用 `npm start` 运行。

---

## 本地构建测试

在部署前，建议先在本地测试构建：

```bash
npm run build
npm start
```
