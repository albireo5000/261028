// 연구 목록: 태그로 거르기 + 20개씩 더 보기
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { site } from '../config/site';
import { researchService, type Research as ResearchItem } from '../services';
import ResearchCard from '../components/ResearchCard';
import TagFilter from '../components/TagFilter';
import { Empty, ErrorMessage, Loading } from '../components/Status';

export default function Research() {
  // 선택한 태그를 주소(?tag=...)에 남겨, 새로고침·뒤로 가기에도 유지
  const [params, setParams] = useSearchParams();
  const tag = params.get('tag');

  const [items, setItems] = useState<ResearchItem[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);

  // 태그가 바뀌면 처음부터 다시 불러옴
  useEffect(() => {
    let alive = true; // 화면을 떠난 뒤 도착한 응답은 무시
    setItems(null);
    setError('');
    researchService
      .list({ tag: tag ?? undefined })
      .then((page) => {
        if (!alive) return;
        setItems(page.items);
        setCursor(page.nextCursor);
      })
      .catch(() => alive && setError('연구 목록을 불러오지 못했습니다.'));
    return () => {
      alive = false;
    };
  }, [tag]);

  async function loadMore() {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const page = await researchService.list({ tag: tag ?? undefined, cursor });
      setItems((prev) => [...(prev ?? []), ...page.items]);
      setCursor(page.nextCursor);
    } catch {
      setError('더 불러오지 못했습니다.');
    } finally {
      setLoadingMore(false);
    }
  }

  function changeTag(next: string | null) {
    setParams(next ? { tag: next } : {});
  }

  return (
    <div>
      <h1 className="page-title">연구</h1>
      <p className="mt-2 text-gray-700">연구실의 연구 성과입니다. 태그를 눌러 주제별로 볼 수 있습니다.</p>

      <div className="mt-6">
        <TagFilter tags={site.researchTags} selected={tag} onChange={changeTag} />
      </div>

      <div className="mt-6">
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {items === null ? (
          !error && <Loading />
        ) : items.length === 0 ? (
          <Empty>이 태그에 해당하는 연구가 없습니다.</Empty>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((r) => (
              <ResearchCard key={r.id} research={r} />
            ))}
          </div>
        )}
        {cursor && (
          <div className="mt-6 text-center">
            <button type="button" className="btn-secondary" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? '불러오는 중…' : '연구 더 보기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
