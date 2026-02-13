import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 상위 폴더(front_origin)의 data를 /data 로 서빙 (public 복사 불필요)
    {
      name: 'serve-parent-data',
      configureServer(server) {
        server.middlewares.use('/data', (req, res, next) => {
          const dataDir = path.resolve(process.cwd(), '..', 'data')
          let url = req.url ?? '/'
          if (url.startsWith('/data')) url = url.slice('/data'.length)
          if (url.startsWith('/')) url = url.slice(1)
          try {
            url = decodeURIComponent(url)
          } catch {
            return next()
          }
          const file = path.join(dataDir, url)
          const normalizedFile = path.normalize(file)
          const normalizedDataDir = path.normalize(dataDir)
          if (!normalizedFile.startsWith(normalizedDataDir) || !fs.existsSync(file)) return next()
          const stat = fs.statSync(file)
          if (!stat.isFile()) return next()
          const ext = path.extname(file).toLowerCase()
          const contentType =
            ext === '.json' ? 'application/json'
            : ext === '.png' ? 'image/png'
            : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
            : ext === '.gif' ? 'image/gif'
            : ext === '.webp' ? 'image/webp'
            : 'application/octet-stream'
          res.setHeader('Content-Type', contentType)
          fs.createReadStream(file).pipe(res)
        })
      },
    },
  ],
  server: {
    port: 5173,
    open: true,
    fs: {
      allow: ['..'],
    },
  },
})
