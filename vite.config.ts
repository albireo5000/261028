import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 설정
export default defineConfig({
  plugins: [react()],
  build: {
    // Firebase 묶음은 원래 큰 편(압축 후 약 170KB)이라 경고 기준을 조금 올림
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Firebase 코드를 따로 묶어, 사이트를 고쳐 다시 배포해도 방문자가 Firebase 파일은 다시 받지 않게 함
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
  },
});
