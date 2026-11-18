import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base: './' 讓網站放在 GitHub Pages 的 /<repo名稱>/ 底下也能正常載入
export default defineConfig({
  plugins: [react()],
  base: './',
  // 本機開發：前端 /api 轉給 Spring Boot（localhost:8080），不必處理 CORS
  server: {
    proxy: { '/api': 'http://localhost:8080' },
  },
})
