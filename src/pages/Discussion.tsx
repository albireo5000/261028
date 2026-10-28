// 토론 목록 + 글쓰기 (승인 회원·교수만)
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LIMITS, discussionService, researchService, type DiscussionPost, type Research } from '../services';
import RequireRole from '../components/RequireRole';
import PostListItem from '../components/PostListItem';
import Card from '../components/Card';
import { Empty, ErrorMessage, Loading } from '../components/Status';

export default function Discussion() {
  return (
    <div>
      <h1 className="page-title">토론</h1>
      <p className="mt-2 text-gray-700">연구실 회원끼리 연구 결과를 나누고 의견을 주고받는 공간입니다.</p>
      <div className="mt-6">
        {/* 권한이 없으면 아래 내용은 아예 불러오지 않음 */}
        <RequireRole allow={['member', 'admin']}>
          <DiscussionBoard />
        </RequireRole>
      </div>
    </div>
  );
}

function DiscussionBoard() {
  const [posts, setPosts] = useState<DiscussionPost[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [writing, setWriting] = useState(false);

  useEffect(() => {
    discussionService
      .listPosts()
      .then((page) => {
        setPosts(page.items);
        setCursor(page.nextCursor);
      })
      .catch(() => setError('토론 목록을 불러오지 못했습니다.'));
  }, []);

  async function loadMore() {
    if (!cursor) return;
    try {
      const page = await discussionService.listPosts({ cursor });
      setPosts((prev) => [...(prev ?? []), ...page.items]);
      setCursor(page.nextCursor);
    } catch {
      setError('더 불러오지 못했습니다.');
    }
  }

  return (
    <div className="space-y-6">
      {writing ? (
        <NewPostForm onCancel={() => setWriting(false)} />
      ) : (
        <button type="button" className="btn-primary" onClick={() => setWriting(true)}>
          새 글 쓰기
        </button>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {posts === null ? (
        !error && <Loading />
      ) : posts.length === 0 ? (
        <Empty>아직 토론 글이 없습니다. 첫 글을 써 보세요.</Empty>
      ) : (
        <Card>
          <ul>
            {posts.map((p) => (
              <PostListItem key={p.id} post={p} />
            ))}
          </ul>
        </Card>
      )}
      {cursor && (
        <div className="text-center">
          <button type="button" className="btn-secondary" onClick={loadMore}>
            글 더 보기
          </button>
        </div>
      )}
    </div>
  );
}

function NewPostForm({ onCancel }: { onCancel: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [researchId, setResearchId] = useState('');
  const [research, setResearch] = useState<Research[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // "관련 연구" 선택 목록 (최근 20건)
  useEffect(() => {
    researchService
      .list()
      .then((page) => setResearch(page.items))
      .catch(() => setResearch([]));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      const post = await discussionService.createPost(
        { title, body, researchId: researchId || undefined },
        user,
      );
      navigate(`/discussion/${post.id}`); // 다 쓰면 그 글로 이동
    } catch (err) {
      setError(err instanceof Error ? err.message : '글을 저장하지 못했습니다.');
      setSaving(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="new-post-title">
        <h2 id="new-post-title" className="section-title">
          새 글 쓰기
        </h2>

        <div>
          <label htmlFor="post-title" className="label">
            제목 <span className="text-sm font-normal text-gray-500">({title.length}/{LIMITS.postTitle})</span>
          </label>
          <input
            id="post-title"
            className="input"
            value={title}
            maxLength={LIMITS.postTitle}
            required
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="post-body" className="label">
            본문 <span className="text-sm font-normal text-gray-500">({body.length}/{LIMITS.postBody})</span>
          </label>
          <textarea
            id="post-body"
            className="input min-h-48"
            value={body}
            maxLength={LIMITS.postBody}
            required
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="post-research" className="label">
            관련 연구 <span className="text-sm font-normal text-gray-500">(선택)</span>
          </label>
          <select id="post-research" className="input" value={researchId} onChange={(e) => setResearchId(e.target.value)}>
            <option value="">선택 안 함</option>
            {research.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? '저장 중…' : '글 올리기'}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>
            취소
          </button>
        </div>
      </form>
    </Card>
  );
}
