import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5175,
    
    proxy: {
      '/api':{
      target: 'https://aniketsblog-lgrb.onrender.com',
      changeOrigin: true,   
      secure: false,
      },
    },
  },
  plugins: [react()],
})
