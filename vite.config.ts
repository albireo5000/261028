import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 설정: React를 쓴다는 것만 알려 주면 됩니다.
export default defineConfig({
  plugins: [react()],
});
