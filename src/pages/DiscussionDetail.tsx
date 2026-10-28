// 토론 글 상세: 본문 + 댓글 (승인 회원·교수만)
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LIMITS,
  canDelete,
  discussionService,
  researchService,
  type Comment,
  type DiscussionPost,
  type Research,
} from '../services';
import RequireRole from '../components/RequireRole';
import Card from '../components/Card';
import { formatDateTime } from '../components/format';
import { Empty, ErrorMessage, Loading } from '../components/Status';
import NotFound from './NotFound';

export default function DiscussionDetail() {
  return (
    <RequireRole allow={['member', 'admin']}>
      <PostView />
    </RequireRole>
  );
}

function PostView() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<DiscussionPost | null | undefined>(undefined);
  const [research, setResearch] = useState<Research | null>(null);
  const [error, setError] = useState('');

  // 글 1건 + 연결된 연구 1건 읽기
  useEffect(() => {
    let alive = true;
    setPost(undefined);
    setResearch(null);
    discussionService
      .getPost(id)
      .then(async (p) => {
        if (!alive) return;
        setPost(p);
        if (p?.researchId) {
          const r = await researchService.get(p.researchId);
          if (alive) setResearch(r);
        }
      })
      .catch(() => alive && setError('글을 불러오지 못했습니다.'));
    return () => {
      alive = false;
    };
  }, [id]);

  async function handleDelete() {
    if (!post || !user) return;
    if (!window.confirm('이 글과 달린 댓글을 모두 삭제할까요? 되돌릴 수 없습니다.')) return;
    try {
      await discussionService.deletePost(post.id, user);
      navigate('/discussion');
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제하지 못했습니다.');
    }
  }

  if (post === undefined && !error) return <Loading />;
  if (post === null) return <NotFound />;

  return (
    <div className="space-y-8">
      <Link to="/discussion" className="text-link">
        ← 토론 목록
      </Link>
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {post && (
        <article>
          <h1 className="page-title">{post.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
            <span>
              {post.authorName} · {formatDateTime(post.createdAt)}
            </span>
            {canDelete(user, post.authorUid) && (
              <button type="button" className="btn-danger" onClick={handleDelete}>
                글 삭제
              </button>
            )}
          </div>

          {research && (
            <p className="mt-5 rounded-md border-l-4 border-navy-800 bg-navy-50 px-4 py-3 text-navy-900">
              관련 연구:{' '}
              <Link to={`/research/${research.id}`} className="text-link">
                {research.title}
              </Link>
            </p>
          )}

          {/* 사용자가 쓴 글은 React가 자동으로 안전하게 표시함 (HTML로 해석하지 않음) */}
          <div className="mt-6 whitespace-pre-wrap break-words text-gray-900">{post.body}</div>
        </article>
      )}

      {post && <Comments postId={post.id} />}
    </div>
  );
}

function Comments({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // 이 글의 댓글만 실시간으로 받아 봄. 화면을 떠나면 구독 해제
  useEffect(() => {
    const unsubscribe = discussionService.watchComments(postId, setComments);
    return unsubscribe;
  }, [postId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      await discussionService.addComment(postId, body, user);
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '댓글을 저장하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(commentId: string) {
    if (!user) return;
    if (!window.confirm('이 댓글을 삭제할까요?')) return;
    try {
      await discussionService.deleteComment(postId, commentId, user);
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제하지 못했습니다.');
    }
  }

  return (
    <section aria-labelledby="comments-title" className="border-t border-navy-100 pt-8">
      <h2 id="comments-title" className="section-title">
        댓글 {comments ? comments.length : ''}
      </h2>

      <div className="mt-4">
        {comments === null ? (
          <Loading />
        ) : comments.length === 0 ? (
          <Empty>첫 댓글을 남겨 보세요.</Empty>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id}>
                <Card>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
                    <span>
                      <span className="font-medium text-gray-900">{c.authorName}</span> · {formatDateTime(c.createdAt)}
                    </span>
                    {canDelete(user, c.authorUid) && (
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleDelete(c.id)}
                        aria-label={`${c.authorName}님의 댓글 삭제`}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-gray-900">{c.body}</p>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <label htmlFor="comment-body" className="label">
          댓글 쓰기 <span className="text-sm font-normal text-gray-500">({body.length}/{LIMITS.commentBody})</span>
        </label>
        <textarea
          id="comment-body"
          className="input min-h-28"
          value={body}
          maxLength={LIMITS.commentBody}
          required
          onChange={(e) => setBody(e.target.value)}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? '저장 중…' : '댓글 올리기'}
        </button>
      </form>
    </section>
  );
}
