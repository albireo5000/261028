// 연구 카드 등에 붙는 작은 태그 표시
export default function Tag({ children }: { children: string }) {
  return <span className="rounded-full bg-navy-50 px-2.5 py-0.5 text-sm text-navy-700 ring-1 ring-inset ring-navy-100">#{children}</span>;
}
