import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // 사이트 기본 글꼴
      fontFamily: {
        sans: ['"Noto Sans KR"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // 회색 대신 푸른빛이 살짝 도는 회색(slate)을 써서 남색과 잘 어울리게 함
        gray: colors.slate,
        // 포인트 색(진한 남색). 색을 바꾸려면 여기 값만 고치면 됩니다.
        navy: {
          50: '#f3f6fb',
          100: '#e1e8f3',
          200: '#c3d0e6',
          300: '#94a9cf',
          600: '#2b4a7e',
          700: '#1e3a66',
          800: '#152c50',
          900: '#0d1f3c',
          950: '#08142a',
        },
      },
    },
  },
  plugins: [],
};
