// 연구 태그 필터 버튼 묶음. 선택된 태그를 다시 누르면 "전체"로 돌아갑니다.
interface Props {
  tags: readonly string[];
  selected: string | null;
  onChange: (tag: string | null) => void;
}

export default function TagFilter({ tags, selected, onChange }: Props) {
  const base = 'rounded-full border px-3 py-1 text-sm font-medium transition-colors';
  const on = 'border-navy-800 bg-navy-800 text-white';
  const off = 'border-gray-300 bg-white text-gray-700 hover:border-navy-600 hover:text-navy-800';

  return (
    <div role="group" aria-label="태그로 거르기" className="flex flex-wrap gap-2">
      <button type="button" aria-pressed={selected === null} className={`${base} ${selected === null ? on : off}`} onClick={() => onChange(null)}>
        전체
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          aria-pressed={selected === tag}
          className={`${base} ${selected === tag ? on : off}`}
          onClick={() => onChange(selected === tag ? null : tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
