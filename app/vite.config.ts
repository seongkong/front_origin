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
          const url = req.url ?? '/'
          const file = path.join(dataDir, url)
          if (!file.startsWith(dataDir) || !fs.existsSync(file)) return next()
          const stat = fs.statSync(file)
          if (!stat.isFile()) return next()
          res.setHeader('Content-Type', url.endsWith('.json') ? 'application/json' : 'image/png')
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
