// 외부 링크 (새 창으로 열림)
// http:// 또는 https:// 로 시작하는 주소만 링크로 만들어, 이상한 주소(javascript: 등)를 막습니다.
import type { ReactNode } from 'react';

export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export default function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  if (!isSafeUrl(href)) return <span className="text-gray-500">{children} (링크 오류)</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-navy-700 underline underline-offset-4 hover:text-navy-900">
      {children}
      <span className="sr-only"> (새 창에서 열림)</span>
      <span aria-hidden="true"> ↗</span>
    </a>
  );
}
