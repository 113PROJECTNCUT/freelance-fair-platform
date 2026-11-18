import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base: './' 讓網站放在 GitHub Pages 的 /<repo名稱>/ 底下也能正常載入
export default defineConfig({
  plugins: [react()],
  base: './',
})
