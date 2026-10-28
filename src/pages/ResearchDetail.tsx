// 연구 상세: 제목, 저자, 요약, 태그, 외부 링크
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { researchService, type Research } from '../services';
import ExternalLink from '../components/ExternalLink';
import Tag from '../components/Tag';
import { ErrorMessage, Loading } from '../components/Status';
import NotFound from './NotFound';

export default function ResearchDetail() {
  const { id = '' } = useParams();
  // undefined: 불러오는 중, null: 없음
  const [item, setItem] = useState<Research | null | undefined>(undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setItem(undefined);
    researchService
      .get(id)
      .then((r) => alive && setItem(r))
      .catch(() => alive && setError('연구 정보를 불러오지 못했습니다.'));
    return () => {
      alive = false;
    };
  }, [id]);

  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (item === undefined) return <Loading />;
  if (item === null) return <NotFound />;

  return (
    <article>
      <Link to="/research" className="text-link">
        ← 연구 목록
      </Link>
      <h1 className="page-title mt-4">{item.title}</h1>
      <p className="mt-3 text-gray-600">
        {item.year} · {item.authors.join(', ')}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {item.tags.map((t) => (
          <Link key={t} to={`/research?tag=${encodeURIComponent(t)}`} aria-label={`${t} 태그 연구 보기`}>
            <Tag>{t}</Tag>
          </Link>
        ))}
      </div>

      <section className="mt-8" aria-labelledby="summary-title">
        <h2 id="summary-title" className="section-title">
          요약
        </h2>
        <p className="mt-3 max-w-3xl whitespace-pre-wrap text-gray-800">{item.summary}</p>
      </section>

      {item.links.length > 0 && (
        <section className="mt-8" aria-labelledby="links-title">
          <h2 id="links-title" className="section-title">
            관련 자료
          </h2>
          <ul className="mt-3 space-y-2">
            {item.links.map((l) => (
              <li key={l.url}>
                <ExternalLink href={l.url}>{l.label}</ExternalLink>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
