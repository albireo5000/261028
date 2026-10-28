/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // 사이트 기본 글꼴
      fontFamily: {
        sans: ['"Noto Sans KR"', 'system-ui', 'sans-serif'],
      },
      // 포인트 색(진한 남색). 색을 바꾸려면 여기 값만 고치면 됩니다.
      colors: {
        navy: {
          50: '#f1f4f9',
          100: '#dde4f0',
          200: '#b9c7e0',
          600: '#2a4677',
          700: '#1f3761',
          800: '#172a4c',
          900: '#0f1e38',
        },
      },
    },
  },
  plugins: [],
};
