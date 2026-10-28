// 연구 목록 카드 1개
import { Link } from 'react-router-dom';
import type { Research } from '../services';
import Card from './Card';
import Tag from './Tag';

export default function ResearchCard({ research }: { research: Research }) {
  return (
    <Card className="h-full border-t-4 border-t-navy-800 transition-shadow hover:shadow-lg hover:shadow-navy-900/5">
      <p className="text-sm font-medium text-navy-600">
        {research.year} · {research.authors.join(', ')}
      </p>
      <h3 className="mt-1 text-lg font-bold leading-snug text-navy-900">
        {/* 제목 링크를 누르면 상세 화면으로 이동 */}
        <Link to={`/research/${research.id}`} className="hover:text-navy-700 hover:underline hover:underline-offset-4">
          {research.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-gray-700">{research.summary}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {research.tags.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>
    </Card>
  );
}
