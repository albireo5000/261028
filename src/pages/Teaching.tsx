// 수업 자료: 과목별로 묶어서 보여 줌 (자료는 외부 링크)
import { useEffect, useState } from 'react';
import { teachingService, type TeachingMaterial } from '../services';
import Card from '../components/Card';
import ExternalLink from '../components/ExternalLink';
import { Empty, ErrorMessage, Loading } from '../components/Status';

// 과목 이름별로 묶기 (처음 나온 순서 유지)
function groupByCourse(items: TeachingMaterial[]): [string, TeachingMaterial[]][] {
  const map = new Map<string, TeachingMaterial[]>();
  for (const item of items) {
    if (!map.has(item.course)) map.set(item.course, []);
    map.get(item.course)!.push(item);
  }
  return [...map.entries()];
}

export default function Teaching() {
  const [items, setItems] = useState<TeachingMaterial[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    teachingService
      .list()
      .then((page) => {
        setItems(page.items);
        setCursor(page.nextCursor);
      })
      .catch(() => setError('수업 자료를 불러오지 못했습니다.'));
  }, []);

  async function loadMore() {
    if (!cursor) return;
    try {
      const page = await teachingService.list({ cursor });
      setItems((prev) => [...(prev ?? []), ...page.items]);
      setCursor(page.nextCursor);
    } catch {
      setError('더 불러오지 못했습니다.');
    }
  }

  return (
    <div>
      <h1 className="page-title">수업 자료</h1>
      <p className="mt-2 text-gray-700">과목별 강의 자료입니다. 링크를 누르면 새 창에서 열립니다.</p>

      <div className="mt-6 space-y-10">
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {items === null ? (
          !error && <Loading />
        ) : items.length === 0 ? (
          <Empty>아직 등록된 수업 자료가 없습니다.</Empty>
        ) : (
          groupByCourse(items).map(([course, list]) => (
            <section key={course} aria-label={course}>
              <h2 className="section-title">{course}</h2>
              <ul className="mt-4 grid gap-4 md:grid-cols-2">
                {list.map((m) => (
                  <li key={m.id}>
                    <Card className="h-full">
                      <p className="text-sm text-gray-600">{m.semester}</p>
                      <h3 className="mt-1 text-lg font-bold text-gray-900">{m.title}</h3>
                      <p className="mt-2 text-gray-700">{m.description}</p>
                      <p className="mt-3">
                        <ExternalLink href={m.url}>자료 열기</ExternalLink>
                      </p>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
        {cursor && (
          <div className="text-center">
            <button type="button" className="btn-secondary" onClick={loadMore}>
              자료 더 보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
