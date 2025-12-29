
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 修正：當使用客製化網域 (yenchia.tw) 時，網站是跑在根目錄 '/'
  // 原本的邏輯會導致它跑在 '/repo-name/' 下，這會導致資源載入失敗 (404)
  base: '/', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
