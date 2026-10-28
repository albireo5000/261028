// 불러오는 중 / 오류 / 비어 있음 안내 문구
import type { ReactNode } from 'react';

export function Loading({ label = '불러오는 중입니다…' }: { label?: string }) {
  return (
    <p role="status" className="py-6 text-gray-600">
      {label}
    </p>
  );
}

export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-800">
      {children}
    </p>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed border-navy-200 bg-navy-50/50 px-4 py-6 text-center text-navy-700">{children}</p>;
}

/** 정보 안내 상자 (로그인 필요, 승인 대기 등) */
export function Notice({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="rounded-lg border border-navy-100 border-t-4 border-t-navy-800 bg-white px-6 py-10 text-center">
      <h2 className="text-xl font-bold text-navy-900">{title}</h2>
      {children && <div className="mt-3 text-gray-700">{children}</div>}
    </section>
  );
}
