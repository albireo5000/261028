// 홈: 연구실 소개 + 최근 연구 3건 + 최근 토론 3건
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { site } from '../config/site';
import { useAuth } from '../context/AuthContext';
import { canUseDiscussion, discussionService, researchService, type DiscussionPost, type Research } from '../services';
import ResearchCard from '../components/ResearchCard';
import PostListItem from '../components/PostListItem';
import { Empty, ErrorMessage, Loading } from '../components/Status';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [research, setResearch] = useState<Research[] | null>(null);
  const [posts, setPosts] = useState<DiscussionPost[] | null>(null);
  const [error, setError] = useState('');
  const allowed = canUseDiscussion(user);

  // 최근 연구 3건 (3개만 읽음)
  useEffect(() => {
    researchService
      .list({ limit: 3 })
      .then((page) => setResearch(page.items))
      .catch(() => setError('연구 목록을 불러오지 못했습니다.'));
  }, []);

  // 최근 토론 3건: 승인 회원에게만 불러옴
  useEffect(() => {
    if (!allowed) {
      setPosts(null);
      return;
    }
    discussionService
      .listPosts({ limit: 3 })
      .then((page) => setPosts(page.items))
      .catch(() => setError('토론 목록을 불러오지 못했습니다.'));
  }, [allowed]);

  return (
    <div className="space-y-14">
      {/* 연구실 소개: 화면 폭 전체를 채우는 남색 배너 */}
      <section aria-labelledby="intro-title" className="on-dark full-bleed -mt-8 bg-navy-800 text-white sm:-mt-10">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          {site.eyebrow && (
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-navy-200">{site.eyebrow}</p>
          )}
          <h1 id="intro-title" className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
            {site.name}
          </h1>
          <p className="mt-4 text-lg text-navy-100 sm:text-xl">{site.tagline}</p>
          <div className="mt-6 max-w-2xl space-y-3 text-navy-100">
            {site.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/research" className="btn-light">
              연구 보기
            </Link>
            <Link to="/teaching" className="btn-outline-light">
              수업 자료
            </Link>
          </div>
        </div>
      </section>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {/* 최근 연구 */}
      <section aria-labelledby="recent-research">
        <div className="section-head">
          <h2 id="recent-research" className="section-title">
            최근 연구
          </h2>
          <Link to="/research" className="text-link">
            전체 보기
          </Link>
        </div>
        <div className="mt-4">
          {research === null ? (
            <Loading />
          ) : research.length === 0 ? (
            <Empty>아직 등록된 연구가 없습니다.</Empty>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {research.map((r) => (
                <ResearchCard key={r.id} research={r} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 최근 토론 */}
      <section aria-labelledby="recent-posts">
        <div className="section-head">
          <h2 id="recent-posts" className="section-title">
            최근 토론
          </h2>
          {allowed && (
            <Link to="/discussion" className="text-link">
              전체 보기
            </Link>
          )}
        </div>
        <div className="mt-4">
          {authLoading ? (
            <Loading />
          ) : !allowed ? (
            <Empty>토론 내용은 로그인한 승인 회원에게만 보입니다.</Empty>
          ) : posts === null ? (
            <Loading />
          ) : posts.length === 0 ? (
            <Empty>아직 토론 글이 없습니다.</Empty>
          ) : (
            <ul>
              {posts.map((p) => (
                <PostListItem key={p.id} post={p} />
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
