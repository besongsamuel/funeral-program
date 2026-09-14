import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function serveAmplifyOutputs(): Plugin {
  const src = path.resolve(__dirname, 'amplify_outputs.json')
  return {
    name: 'amplify-outputs',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== '/amplify_outputs.json') {
          next()
          return
        }
        if (!fs.existsSync(src)) {
          res.statusCode = 404
          res.end()
          return
        }
        res.setHeader('Content-Type', 'application/json')
        res.end(fs.readFileSync(src))
      })
    },
    generateBundle() {
      if (!fs.existsSync(src)) return
      this.emitFile({
        type: 'asset',
        fileName: 'amplify_outputs.json',
        source: fs.readFileSync(src),
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), serveAmplifyOutputs()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
