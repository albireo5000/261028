// 흰 바탕 테두리 상자. 목록 항목을 감쌀 때 씁니다.
import type { ReactNode } from 'react';

export default function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-gray-200 bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}
