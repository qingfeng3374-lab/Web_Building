#!/usr/bin/env bash
# 常用命令速查。从仓库根目录执行。
set -e

npm install           # 安装依赖（用 pnpm 亦可）
npm run dev           # 开发服务器 → http://localhost:4321
npm run build         # 打包到 dist/，纯静态产物
npm run preview       # 本地预览打包产物
npm run verify        # 四道门禁：i18n 一致性 + 设计令牌 + 类型检查 + 测试 + 构建

# 开发服务器跑在后台，用这三条管理：
#   npx astro dev status
#   npx astro dev logs
#   npx astro dev stop
