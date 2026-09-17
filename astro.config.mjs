// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

/**
 * 站点配置
 * - output: 'static' —— 纯前端 SSG，产物 dist/ 可直接静态托管（需求 R1）
 * - build.format: 'directory' —— URL 带尾斜杠，兼容任意静态服务器 / 子路径部署
 * - SITE_BASE 环境变量支持部署到 GitHub Pages 子目录
 */
const BASE = process.env.SITE_BASE || '/';

export default defineConfig({
  site: process.env.SITE_URL || 'https://example.com',
  base: BASE,
  output: 'static',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  /**
   * 开发服务器监听 0.0.0.0，而不是默认的仅回环。
   *
   * 默认配置在 Windows 上只绑到 `[::1]`（IPv6 回环）。浏览器解析 `localhost`
   * 时常常优先取 IPv4 的 `127.0.0.1`，而那里没人监听 —— 于是出现
   * 「服务器明明在跑，浏览器却打不开」。绑到 0.0.0.0 同时覆盖 IPv4 与 IPv6。
   *
   * 注意必须写在**顶层 `server`**：`vite.server.host` 会被 Astro 自己的
   * 服务器配置覆盖，写在那里不生效。
   *
   * 附带好处：同一局域网内的手机可以直接访问 —— 一门讲响应式布局的课，
   * 本来就该在真机上验证，而不是只拖一拖桌面浏览器的窗口。
   */
  server: { host: true, port: 4321 },
  integrations: [svelte(), sitemap({ i18n: { defaultLocale: 'zh', locales: { zh: 'zh-CN', en: 'en-US' } } })],
  markdown: {
    shikiConfig: { theme: 'github-dark-default', wrap: false },
  },
  vite: {
    build: {
      // 演示组件独立分包，保证首屏不含任何 D3（见 DESIGN.md §7.1）
      chunkSizeWarningLimit: 900,
    },
    server: {
      watch: {
        // 项目根目录里的参考样例（含 CJK 与 · 的文件名）不属于源码，
        // 把它们排除在文件监听之外。
        ignored: ['**/node_modules/**', '**/dist/**', '**/.pnpm-store/**', '**/第*'],
      },
    },
    optimizeDeps: {
      /**
       * 必须显式列出：这些依赖只出现在**动态 import 的演示组件**里，
       * Vite 在启动扫描时看不到它们，会等到读者第一次打开演示才去优化 ——
       * 而那次优化会让已经发出的 `?v=hash` 请求全部失效，
       * 表现就是「演示加载失败」（504 Outdated Optimize Dep）。
       * 提前声明，让它们在 dev 启动时一次性预打包。
       */
      include: [
        'd3-selection',
        'd3-scale',
        'd3-axis',
        'd3-shape',
        'd3-array',
        'd3-interpolate',
        'd3-color',
        'd3-drag',
        'd3-ease',
        'd3-transition',
        'p5',
      ],
    },
  },
});
