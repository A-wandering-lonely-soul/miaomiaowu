import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = (env.VITE_APP_API_BASE || 'https://aprillie.online').trim()
  let httpTarget = 'https://aprillie.online'
  let isDirectBackend = false
  try {
    const apiUrl = new URL(apiBase)
    httpTarget = `${apiUrl.protocol}//${apiUrl.host}`
    isDirectBackend = apiUrl.port === '8082' || ['localhost', '127.0.0.1'].includes(apiUrl.hostname)
  } catch { /* */ }
  // 与旧 chat_vue 的 devServer 一致：SockJS 先对 /ws/ep/info 发普通 HTTP GET，代理 target 须为 http(s)，
  // 不能写 wss://（否则 /info 可能 400）；WebSocket 升级仍由 ws: true 处理。
  return {
    // sockjs-client 等包在浏览器里引用 Node 的 global，需映射到 globalThis
    define: {
      global: 'globalThis',
    },
    plugins: [vue()],
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    css: {
      preprocessorOptions: {
        scss: {
          // 消除 legacy-js-api 弃用告警（需配合 sass-embedded）
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    },
    server: {
      host: 'localhost',
      port: 5173,
      proxy: {
        '/ws': { target: httpTarget, ws: true, changeOrigin: true, secure: false },
        '/api': { target: httpTarget, changeOrigin: true, secure: false, rewrite: isDirectBackend ? (p) => p.replace(/^\/api/, '') : undefined },
      },
    },
  }
})